/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/appDescriptorChanges/prepareAppDescriptorMap",
	"sap/ui/fl/apply/_internal/flexState/changes/prepareChangesMap",
	"sap/ui/fl/apply/_internal/flexState/compVariants/prepareCompVariantsMap",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/FlexInfoSession",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/Utils"
], function(
	_omit,
	each,
	merge,
	ObjectPath,
	Log,
	Component,
	FlexObjectFactory,
	States,
	prepareAppDescriptorMap,
	prepareChangesMap,
	prepareCompVariantsMap,
	DataSelector,
	InitialPrepareFunctions,
	Loader,
	ManifestUtils,
	FlexInfoSession,
	LayerUtils,
	requireAsync,
	Utils
) {
	"use strict";

	/**
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 *	{
	 * 		preparedMaps: {
	 * 			appDescriptorMap: {},
	 * 			changesMap: {},
	 * 			variantsMap: {},
	 * 			compVariantsMap: {},
	 * 		},
	 * 		storageResponse: {
	 * 			changes: {
	 * 				changes: [...],
	 * 				comp: {
	 * 					variants: [...],
	 * 					changes: [...],
	 * 					defaultVariants: [...],
	 * 					standardVariants: [...]
	 * 				}
	 * 				variants: [...],
	 * 				variantChanges: [...],
	 * 				variantDependentControlChanges: [...],
	 * 				variantManagementChanges: [...],
	 * 				ui2personalization: {...}
	 * 			},
	 * 			loadModules: <boolean>
	 * 		},
	 * 		unfilteredStorageResponse: {...}, // same as above but without layer filtering
	 * 		runtimePersistence: {
	 * 			flexObjects: [...],
	 * 			runtimeOnlyData: {}
	 * 		}
	 *		partialFlexState: <boolean>,
	 *		componentId: "<componentId>",
	 *		componentData: {...}
	 *	}
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.FlexState
	 * @experimental
	 * @since 1.73
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var FlexState = {};

	var _mInstances = {};
	var _mNavigationHandlers = {};
	var _mInitPromises = {};
	var _oShellNavigationService;
	var _oURLParsingService;
	var _oChangePersistenceFactory;
	var _mFlexObjectInfo = {
		appDescriptorChanges: {
			prepareFunction: prepareAppDescriptorMap,
			pathInResponse: []
		},
		changes: {
			initialPreparationFunctionName: "uiChanges",
			prepareFunction: prepareChangesMap,
			pathInResponse: ["changes"]
		},
		variants: {
			initialPreparationFunctionName: "variants",
			pathInResponse: ["variants", "variantChanges", "variantDependentControlChanges", "variantManagementChanges"]
		},
		compVariants: {
			prepareFunction: prepareCompVariantsMap,
			pathInResponse: ["comp.variants", "comp.standardVariants", "comp.defaultVariants", "comp.changes"]
		}
	};
	// some runtime data is only fetched once (e.g. during control init) and has to survive an invalidation of the FlexState
	// TODO: Move to runtime persistence as soon as flex objects are no longer deleted during cache invalidation
	// but instead updated with the new data from the flex response
	var _mExternalData = {
		compVariants: {},
		flexObjects: {}
	};

	function prepareChangeDefinitions(sStorageResponseKey, vStorageResponsePart) {
		var fnPreparation = {
			comp: function() {
				return Object.values(vStorageResponsePart).reduce(function(aChangeDefinitions, oChangeDefinition) {
					return aChangeDefinitions.concat(oChangeDefinition);
				}, []);
			},
			variants: function() {
				return vStorageResponsePart.map(function(oVariant) {
					var bParentVariantExists = (
						oVariant.variantReference === oVariant.variantManagementReference
						|| vStorageResponsePart.some(function(oOtherVariant) {
							return (
								oOtherVariant.variantManagementReference === oVariant.variantManagementReference
								&& oOtherVariant.fileName === oVariant.variantReference
							);
						})
					);
					// If the parent variant no longer exists, change the reference to the standard variant
					if (!bParentVariantExists) {
						return Object.assign(
							{},
							oVariant,
							{ variantReference: oVariant.variantManagementReference }
						);
					}
					return oVariant;
				});
			}
		}[sStorageResponseKey];
		if (fnPreparation) {
			return fnPreparation();
		}
		return Array.isArray(vStorageResponsePart) ? vStorageResponsePart : [];
	}

	function enhancePropertyBag(mPropertyBag) {
		var oComponent = Component.get(mPropertyBag.componentId);
		mPropertyBag.componentData = mPropertyBag.componentData || (oComponent && oComponent.getComponentData()) || {};
		mPropertyBag.manifest = mPropertyBag.manifest || mPropertyBag.rawManifest || (oComponent && oComponent.getManifestObject()) || {};
		mPropertyBag.reference = mPropertyBag.reference || ManifestUtils.getFlexReference(mPropertyBag);
	}

	function createFlexObjects(oStorageResponse) {
		var aFlexObjects = [];
		each(oStorageResponse.changes, function(sKey, vValue) {
			prepareChangeDefinitions(sKey, vValue).forEach(function(oChangeDef) {
				aFlexObjects.push(FlexObjectFactory.createFromFileContent(oChangeDef, null, true));
			});
		});
		return aFlexObjects;
	}

	function runInitialPreparation(sMapName, mPropertyBag) {
		var sPreparationFunctionName = _mFlexObjectInfo[sMapName].initialPreparationFunctionName;
		var fnPreparation = InitialPrepareFunctions[sPreparationFunctionName];
		if (fnPreparation) {
			return fnPreparation(mPropertyBag);
		}
		return undefined;
	}

	function initializeState(sMapName, mPropertyBag, sReference) {
		var oUpdate = runInitialPreparation(sMapName, mPropertyBag);
		if (oUpdate) {
			updateInstance(sReference, oUpdate);
		}
	}

	var oFlexObjectsDataSelector = new DataSelector({
		id: "flexObjects",
		parameterKey: "reference",
		executeFunction: function(oData, sReference) {
			if (!_mInstances[sReference]) {
				return [];
			}
			var oPersistence = _mInstances[sReference].runtimePersistence;
			return oPersistence.flexObjects.concat(
				oPersistence.runtimeOnlyData.flexObjects || [],
				_mExternalData.flexObjects[sReference][_mInstances[sReference].componentId] || []
			);
		}
	});

	function getInstanceEntryOrThrowError(sReference, sMapName) {
		if (!_mInstances[sReference]) {
			throw new Error("State is not yet initialized");
		}

		if (!_mInstances[sReference].preparedMaps[sMapName]) {
			var mPropertyBag = {
				unfilteredStorageResponse: _mInstances[sReference].unfilteredStorageResponse,
				storageResponse: _mInstances[sReference].storageResponse,
				componentId: _mInstances[sReference].componentId,
				componentData: _mInstances[sReference].componentData,
				reference: sReference,
				runtimePersistence: _mInstances[sReference].runtimePersistence
			};
			_mInstances[sReference].preparedMaps[sMapName] = FlexState.callPrepareFunction(sMapName, mPropertyBag);
			initializeState(sMapName, mPropertyBag, sReference);
		}

		return _mInstances[sReference].preparedMaps[sMapName];
	}

	function updateInstance(sReference, oUpdate) {
		_mInstances[sReference] = merge(_mInstances[sReference], oUpdate);
		oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
	}

	function getAppDescriptorMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "appDescriptorChanges");
	}

	function getChangesMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "changes");
	}

	function getCompVariantsMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "compVariants");
	}

	function buildRuntimePersistence(oStorageResponse, aExternalFlexObjects) {
		var oFlexInstance = {
			flexObjects: createFlexObjects(oStorageResponse),
			runtimeOnlyData: {
				flexObjects: []
			}
		};
		Object.keys(_mFlexObjectInfo).forEach(function(sMapName) {
			var oUpdate = runInitialPreparation(sMapName, {
				storageResponse: oStorageResponse,
				externalData: aExternalFlexObjects
			});
			if (oUpdate) {
				oFlexInstance = merge(oFlexInstance, oUpdate);
			}
		});
		return oFlexInstance;
	}

	function updateRuntimePersistence(sReference, oStorageResponse, oRuntimePersistence) {
		var aFlexObjects = oRuntimePersistence.flexObjects.slice();
		var iInitialFlexObjectsLength = aFlexObjects.length;
		var bUpdate;
		var aChangeDefinitions = [];

		each(oStorageResponse.changes, function(sKey, vValue) {
			prepareChangeDefinitions(sKey, vValue).forEach(function(oChangeDef) {
				aChangeDefinitions.push(oChangeDef);
			});
		});

		_mInstances[sReference].runtimePersistence = Object.assign(oRuntimePersistence, {
			flexObjects: aChangeDefinitions.map(function(oChangeDef) {
				var iObjectIndex;
				// Only keep FlexObjects found in the storage change definitions
				var oExistingFlexObject = aFlexObjects.find(function(oFlexObject, iIndex) {
					iObjectIndex = iIndex;
					return oFlexObject.getId() === oChangeDef.fileName;
				});
				if (oExistingFlexObject) {
					aFlexObjects.splice(iObjectIndex, 1);
					// Only update FlexObjects which were modified (new, updated)
					if (oExistingFlexObject.getState() !== States.LifecycleState.PERSISTED) {
						oExistingFlexObject.setResponse(oChangeDef);
						bUpdate = true;
					}
					return oExistingFlexObject;
				}
				// If unknown change definitions are found, throw error (storage does not create flex objects)
				throw new Error("Error updating runtime persistence: storage returned unknown flex objects");
			})
		});

		// If the final length is different, an object is no longer there (e.g. new version requested)
		if (iInitialFlexObjectsLength !== _mInstances[sReference].runtimePersistence.flexObjects.length) {
			bUpdate = true;
		}

		return bUpdate;
	}

	function initializeNewInstance(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var bDataUpdated = false;
		if (!_mInstances[sReference].componentData) {
			var oComponent = Component.get(mPropertyBag.componentId);
			_mInstances[sReference].componentData = oComponent ? oComponent.getComponentData() : mPropertyBag.componentData;
			bDataUpdated = true;
		}
		if (!_mInstances[sReference].storageResponse) {
			_mInstances[sReference].storageResponse = filterByMaxLayer(_mInstances[sReference].unfilteredStorageResponse);
			// Flex objects need to be recreated
			delete _mInstances[sReference].runtimePersistence;
			bDataUpdated = true;
		}

		if (!ObjectPath.get(["flexObjects", sReference, mPropertyBag.componentId], _mExternalData)) {
			ObjectPath.set(["flexObjects", sReference, mPropertyBag.componentId], [], _mExternalData);
		}

		if (!_mInstances[sReference].runtimePersistence) {
			_mInstances[sReference].runtimePersistence = buildRuntimePersistence(
				_mInstances[sReference].storageResponse,
				_mExternalData.flexObjects[sReference][mPropertyBag.componentId] || []
			);
			bDataUpdated = true;
		}

		if (bDataUpdated) {
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	}

	// TODO turn into utility or put it somewhere central
	function filterByMaxLayer(mResponse) {
		var mFilteredReturn = merge({}, mResponse);
		var mFlexObjects = mFilteredReturn.changes;
		var oURLParsingService = getUShellService("URLParsing");
		if (LayerUtils.isLayerFilteringRequired(oURLParsingService)) {
			each(_mFlexObjectInfo, function(iIndex, mFlexObjectInfo) {
				mFlexObjectInfo.pathInResponse.forEach(function(sPath) {
					ObjectPath.set(sPath, LayerUtils.filterChangeDefinitionsByMaxLayer(ObjectPath.get(sPath, mFlexObjects), oURLParsingService), mFlexObjects);
				});
			});
		}
		return mFilteredReturn;
	}

	function loadFlexData(mPropertyBag) {
		_mInitPromises[mPropertyBag.reference] = Loader.loadFlexData(mPropertyBag)
		.then(function(mResponse) {
			_mInstances[mPropertyBag.reference] = merge({}, {
				unfilteredStorageResponse: mResponse,
				preparedMaps: {},
				componentId: mPropertyBag.componentId,
				componentData: mPropertyBag.componentData,
				partialFlexState: mPropertyBag.partialFlexState
			});

			registerMaxLayerHandler(mPropertyBag.reference);
			storeInfoInSession(mPropertyBag.reference, mResponse);

			// no further changes to storageResponse properties allowed
			Object.freeze(_mInstances[mPropertyBag.reference].storageResponse);
			Object.freeze(_mInstances[mPropertyBag.reference].unfilteredStorageResponse);
			return mResponse;
		});

		return _mInitPromises[mPropertyBag.reference];
	}

	function storeInfoInSession(sReference, mResponse) {
		var oResponse = mResponse && mResponse.changes || {};
		var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		if (oFlexInfoSession === null) {
			oFlexInfoSession = {};
		}
		if (oResponse.info !== undefined) {
			oFlexInfoSession = Object.assign(oFlexInfoSession, oResponse.info);
		}
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);
	}

	function registerMaxLayerHandler(sReference) {
		var oShellNavigationService = getUShellService("ShellNavigation");
		if (oShellNavigationService && !_mNavigationHandlers[sReference]) {
			_mNavigationHandlers[sReference] = handleMaxLayerChange.bind(null, sReference);
			oShellNavigationService.registerNavigationFilter(_mNavigationHandlers[sReference]);
		}
	}

	function deRegisterMaxLayerHandler(sReference) {
		var oShellNavigationService = getUShellService("ShellNavigation");
		if (oShellNavigationService) {
			if (_mNavigationHandlers[sReference]) {
				oShellNavigationService.unregisterNavigationFilter(_mNavigationHandlers[sReference]);
				delete _mNavigationHandlers[sReference];
			}
		}
	}

	function handleMaxLayerChange(sReference, sNewHash, sOldHash) {
		var oShellNavigationService = getUShellService("ShellNavigation");
		if (oShellNavigationService) {
			try {
				var sCurrentMaxLayer = LayerUtils.getMaxLayerTechnicalParameter(sNewHash, getUShellService("URLParsing"));
				var sPreviousMaxLayer = LayerUtils.getMaxLayerTechnicalParameter(sOldHash, getUShellService("URLParsing"));
				if (sCurrentMaxLayer !== sPreviousMaxLayer) {
					FlexState.rebuildFilteredResponse(sReference);
				}
			} catch (oError) {
				// required to hinder any errors - can break FLP navigation
				Log.error(oError.message);
			}
			return oShellNavigationService.NavigationFilterStatus.Continue;
		}
		return undefined;
	}

	function checkPartialFlexState(mInitProperties) {
		var oFlexInstance = _mInstances[mInitProperties.reference];
		if (oFlexInstance.partialFlexState === true && mInitProperties.partialFlexState !== true) {
			oFlexInstance.partialFlexState = false;
			mInitProperties.partialFlexData = merge({}, oFlexInstance.unfilteredStorageResponse.changes);
			mInitProperties.reInitialize = true;
		}
		return mInitProperties;
	}

	function checkComponentId(mInitProperties) {
		var sFlexInstanceComponentId = _mInstances[mInitProperties.reference].componentId;
		// if the component with the same reference was rendered with a new ID - clear existing state
		if (!mInitProperties.reInitialize && sFlexInstanceComponentId !== mInitProperties.componentId) {
			mInitProperties.reInitialize = true;
		}
		return mInitProperties;
	}

	function loadUShellServices() {
		return Promise.all([
			Utils.getUShellService("ShellNavigation"),
			Utils.getUShellService("URLParsing")
		])
		.then(function(aServices) {
			_oShellNavigationService = aServices[0];
			_oURLParsingService = aServices[1];
		})
		.catch(function(oError) {
			Log.error("Error getting service from Unified Shell: " + oError.message);
		});
	}

	function getUShellService(sServiceName) {
		if (Utils.getUshellContainer()) {
			if (sServiceName === "ShellNavigation") {
				return _oShellNavigationService;
			} else if (sServiceName === "URLParsing") {
				return _oURLParsingService;
			}
		}
		return undefined;
	}

	// TODO: get rid of the following module dependencies as soon as the change state
	// is migrated from changePersistenceFactory to the FlexState
	function lazyLoadModules() {
		return requireAsync("sap/ui/fl/ChangePersistenceFactory").then(function(oModule) {
			_oChangePersistenceFactory = oModule;
		})
		.catch(function(oError) {
			Log.error("Error loading modules: " + oError.message);
		});
	}

	/**
	 * Initializes the FlexState for a given reference. A request for the flex data is sent to the Loader and the response is saved.
	 * The FlexState can only be initialized once, every subsequent init call will just resolve as soon as it is initialized.
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.componentId - ID of the component
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @param {object} [mPropertyBag.manifest] - Manifest that belongs to current component
	 * @param {object} [mPropertyBag.rawManifest] - Raw JSON manifest that belongs to current component
	 * @param {string} [mPropertyBag.componentData] - Component data of the current component
	 * @param {object} [mPropertyBag.asyncHints] - Async hints passed from the app index to the component processing
	 * @param {string} [mPropertyBag.version] - Number of the version in which the state should be initialized
	 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation for which the state should be initialized
	 * @param {boolean} [mPropertyBag.partialFlexState=false] - if true state is initialized partially and does not include flex bundles
	 * @returns {Promise<undefined>} Resolves a promise as soon as FlexState is initialized
	 */
	FlexState.initialize = function(mPropertyBag) {
		return Promise.all([
			loadUShellServices(),
			lazyLoadModules()
		])
		.then(function() {
			enhancePropertyBag(mPropertyBag);
			var sFlexReference = mPropertyBag.reference;

			if (_mInitPromises[sFlexReference]) {
				return _mInitPromises[sFlexReference]
				.then(checkPartialFlexState.bind(null, mPropertyBag))
				.then(checkComponentId)
				.then(function(mEvaluatedProperties) {
					return mEvaluatedProperties.reInitialize
						? loadFlexData(mEvaluatedProperties)
						: _mInstances[sFlexReference].unfilteredStorageResponse;
				});
			}

			return loadFlexData(mPropertyBag);
		})
		.then(function(mPropertyBag) {
			initializeNewInstance(mPropertyBag);
		}.bind(null, mPropertyBag));
	};

	/**
	 * Checks whether flex state of an associated reference or a control has been initialized or not
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {object} [mPropertyBag.control] - ID of the control
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @returns {boolean} <code>true</code> in case flex state has been initialized
	 */
	FlexState.isInitialized = function(mPropertyBag) {
		var sReference = mPropertyBag.reference ? mPropertyBag.reference : ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
		return !!_mInstances[sReference];
	};

	/**
	 * Clears the cache and then triggers a call to the backend to fetch new data
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.componentId - ID of the component
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @param {object} [mPropertyBag.manifest] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.componentData] - Component data of the current component
	 * @param {string} [mPropertyBag.version] - Number of the version in which the state should be initialized
	 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation for which the state should be initialized
	 * @returns {Promise<undefined>} Resolves a promise as soon as FlexState is initialized again
	 */
	FlexState.clearAndInitialize = function(mPropertyBag) {
		enhancePropertyBag(mPropertyBag);
		FlexState.clearState(mPropertyBag.reference);
		return FlexState.initialize(mPropertyBag);
	};

	/**
	 * Triggers a call to the backend to fetch new data and update the runtime persistence
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.componentId - ID of the component
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @param {object} [mPropertyBag.manifest] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.componentData] - Component data of the current component
	 * @param {string} [mPropertyBag.version] - Number of the version in which the state should be updated
	 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation for which the state should be updated
	 * @returns {Promise<undefined>} Resolves when the data is loaded and the runtime persistence is updated
	 */
	FlexState.update = function(mPropertyBag) {
		enhancePropertyBag(mPropertyBag);
		var sReference = mPropertyBag.reference;

		deRegisterMaxLayerHandler(sReference);

		var oCurrentRuntimePersistence = _mInstances[sReference].runtimePersistence;

		// TODO: get rid of the following persistence operations as soon as the change state
		// is migrated from ChangePersistenceFactory to the FlexState
		if (
			_oChangePersistenceFactory
			&& (_oChangePersistenceFactory._instanceCache || {}).hasOwnProperty(sReference)
		) {
			_oChangePersistenceFactory._instanceCache[sReference].removeDirtyChanges();
		}

		// TODO Do we need to consider partial flex state

		return (_mInitPromises[sReference] || Promise.resolve())
		.then(loadFlexData.bind(this, mPropertyBag))
		.then(function() {
			_mInstances[sReference].storageResponse = filterByMaxLayer(_mInstances[sReference].unfilteredStorageResponse);
			var bUpdated = updateRuntimePersistence(
				sReference,
				_mInstances[sReference].storageResponse,
				oCurrentRuntimePersistence
			);
			if (bUpdated) {
				oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
			}
		});
	};

	FlexState.clearState = function(sReference) {
		if (sReference) {
			deRegisterMaxLayerHandler(sReference);
			delete _mInstances[sReference];
			delete _mInitPromises[sReference];
			oFlexObjectsDataSelector.clearCachedResult({ reference: sReference });
			// TODO: get rid of the following deletes as soon as the change state
			// is migrated from changePersistenceFactory to the FlexState
			if (
				_oChangePersistenceFactory
				&& (_oChangePersistenceFactory._instanceCache || {}).hasOwnProperty(sReference)
			) {
				_oChangePersistenceFactory._instanceCache[sReference].removeDirtyChanges();
			}
		} else {
			Object.keys(_mInstances).forEach(function(sReference) {
				deRegisterMaxLayerHandler(sReference);
			});
			_mInstances = {};
			_mInitPromises = {};
			oFlexObjectsDataSelector.clearCachedResult();
		}
	};

	FlexState.setInitialNonFlCompVariantData = function(sReference, sPersistencyKey, oStandardVariant, aVariants, sSVMControlId) {
		_mExternalData.compVariants[sReference] = _mExternalData.compVariants[sReference] || {};
		_mExternalData.compVariants[sReference][sPersistencyKey] = {};
		_mExternalData.compVariants[sReference][sPersistencyKey].standardVariant = oStandardVariant;
		_mExternalData.compVariants[sReference][sPersistencyKey].variants = aVariants;
		_mExternalData.compVariants[sReference][sPersistencyKey].controlId = sSVMControlId;
	};

	FlexState.getInitialNonFlCompVariantData = function(sReference) {
		return _mExternalData.compVariants[sReference];
	};

	FlexState.resetInitialNonFlCompVariantData = function(sReference) {
		delete _mExternalData.compVariants[sReference];
	};

	/**
	 * Adds a runtime-steady object to the external data map which survives when the FlexState is cleared.
	 * For example: a fake standard variant.
	 * Fake standard variant refers to a variant that was not created based on file content returned from the backend.
	 * If the flex response contains no variants that inherited from the standard variant, it is impossible
	 * to know its ID without access to the related variant management control. Thus the standard variant cannot
	 * be created during initialization but has to be added by the VariantManagement control via this method.
	 * @param {string} sReference - Flex reference of the app
	 * @param {string} sComponentId - ID of the component
	 * @param {object} oFlexObject - Flex object to be added as runtime-steady
	 */
	FlexState.addRuntimeSteadyObject = function(sReference, sComponentId, oFlexObject) {
		if (!_mExternalData.flexObjects[sReference]) {
			_mExternalData.flexObjects[sReference] = {};
		}
		if (!_mExternalData.flexObjects[sReference][sComponentId]) {
			_mExternalData.flexObjects[sReference][sComponentId] = [];
		}
		_mExternalData.flexObjects[sReference][sComponentId].push(oFlexObject);
		oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
	};

	/**
	 * Clears the runtime-steady objects of the given component.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {string} sComponentId - ID of the component
	 */
	FlexState.clearRuntimeSteadyObjects = function(sReference, sComponentId) {
		// External data is currently only used to store the standard variant
		if (_mExternalData.flexObjects[sReference]) {
			delete _mExternalData.flexObjects[sReference][sComponentId];
			// Only called during destruction, no need to recalculate new state immediately
			oFlexObjectsDataSelector.clearCachedResult({ reference: sReference });
		}
	};

	/**
	 * Recreates the saved filtered storage response and runtime persistence
	 * and removes the internal maps for the given reference.
	 *
	 * @param {string} sReference - Flex reference of the app
	 */
	FlexState.rebuildFilteredResponse = function(sReference) {
		if (_mInstances[sReference]) {
			_mInstances[sReference].preparedMaps = {};
			_mInstances[sReference].storageResponse = filterByMaxLayer(_mInstances[sReference].unfilteredStorageResponse);
			// Storage response has changed, recreate the flex objects
			_mInstances[sReference].runtimePersistence = buildRuntimePersistence(
				_mInstances[sReference].storageResponse,
				_mExternalData.flexObjects[sReference][_mInstances[sReference].componentId] || []
			);
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	};

	FlexState.addDirtyFlexObject = function(sReference, oFlexObject) {
		// FIXME: Currently called from the ChangePersistence which might be
		// independent of FlexState in some test cases
		// Once the ChangePersistence is no longer used
		// make sure to remove the safeguard
		if (_mInstances[sReference]) {
			_mInstances[sReference].runtimePersistence.flexObjects.push(oFlexObject);
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	};

	FlexState.addDirtyFlexObjects = function(sReference, aFlexObjects) {
		if (aFlexObjects.length > 0 && _mInstances[sReference]) {
			_mInstances[sReference].runtimePersistence.flexObjects =
				_mInstances[sReference].runtimePersistence.flexObjects.concat(aFlexObjects);
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	};

	FlexState.removeDirtyFlexObject = function(sReference, oFlexObject) {
		// FIXME: Currently called from the ChangePersistence which might be
		// independent of FlexState in some test cases
		// Once the ChangePersistence is no longer used
		// make sure to remove the safeguard
		if (_mInstances[sReference]) {
			var aFlexObjects = _mInstances[sReference].runtimePersistence.flexObjects;
			var iIndex = aFlexObjects.indexOf(oFlexObject);
			aFlexObjects.splice(iIndex, 1);
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	};

	FlexState.removeDirtyFlexObjects = function(sReference, aFlexObjects) {
		// FIXME: Currently called from the ChangePersistence which might be
		// independent of FlexState in some test cases
		// Once the ChangePersistence is no longer used
		// make sure to remove the safeguard
		if (_mInstances[sReference] && aFlexObjects.length > 0) {
			var aCurrentFlexObjects = _mInstances[sReference].runtimePersistence.flexObjects;
			aFlexObjects.forEach(function(oFlexObject) {
				var iIndex = aCurrentFlexObjects.indexOf(oFlexObject);
				aCurrentFlexObjects.splice(iIndex, 1);
			});
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	};

	FlexState.getFlexObjectsDataSelector = function() {
		return oFlexObjectsDataSelector;
	};

	FlexState.getUIChanges = function(sReference) {
		return getChangesMap(sReference).changes;
	};

	FlexState.getAppDescriptorChanges = function(sReference) {
		return getAppDescriptorMap(sReference).appDescriptorChanges;
	};

	FlexState.getUI2Personalization = function(sReference) {
		return _mInstances[sReference].unfilteredStorageResponse.changes.ui2personalization;
	};

	FlexState.getCompVariantsMap = function(sReference) {
		return getCompVariantsMap(sReference);
	};

	FlexState.callPrepareFunction = function(sMapName, mPropertyBag) {
		return _mFlexObjectInfo[sMapName].prepareFunction(mPropertyBag);
	};

	// temporary function until ChangePersistence.getChangesForComponent is gone
	FlexState.getStorageResponse = function(sReference) {
		if (_mInitPromises[sReference]) {
			return _mInitPromises[sReference].then(function() {
				return _mInstances[sReference].unfilteredStorageResponse;
			});
		}
		return Promise.resolve();
	};

	// temporary function until the maps are ready
	FlexState.getFlexObjectsFromStorageResponse = function(sReference) {
		return _mInstances[sReference] && _mInstances[sReference].unfilteredStorageResponse.changes;
	};

	FlexState.getComponentData = function(sReference) {
		return _mInstances[sReference] && _mInstances[sReference].componentData;
	};

	return FlexState;
});
