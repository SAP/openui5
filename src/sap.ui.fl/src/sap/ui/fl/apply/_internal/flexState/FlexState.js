/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/Deferred",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/compVariants/prepareCompVariantsMap",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/LayerUtils"
], function(
	_omit,
	Deferred,
	each,
	merge,
	ObjectPath,
	Log,
	Component,
	FlexObjectFactory,
	States,
	prepareCompVariantsMap,
	DataSelector,
	InitialPrepareFunctions,
	Loader,
	ManifestUtils,
	FlexInfoSession,
	StorageUtils,
	LayerUtils
) {
	"use strict";

	const sAppDescriptorNamespace = "sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange";
	const sAnnotationNamespace = "sap.ui.fl.apply._internal.flexObjects.AnnotationChange";

	/**
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 *	{
	 * 		preparedMaps: {
	 * 			compVariantsMap: {},
	 * 		},
	 * 		storageResponse: {
	 * 			changes: {
	 * 				annotationChanges: [...],
	 * 				appDescriptorChanges: [...],
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
	 * 			runtimeOnlyData: {
	 * 				liveDependencyMap: {...}
	 * 			}
	 * 		},
	 * 		maxLayer: <string>,
	 * 		emptyState: <boolean>,
	 *		partialFlexState: <boolean>,
	 *		componentId: "<componentId>",
	 *		componentData: {...}
	 *	}
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.FlexState
	 * @since 1.73
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var FlexState = {};

	var _mInstances = {};
	var _mInitPromises = {};
	var _mFlexObjectInfo = {
		appDescriptorChanges: {
			pathInResponse: []
		},
		annotationChanges: {
			pathInResponse: []
		},
		changes: {
			initialPreparationFunctionName: "uiChanges",
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
			comp() {
				return Object.values(vStorageResponsePart).reduce(function(aChangeDefinitions, oChangeDefinition) {
					return aChangeDefinitions.concat(oChangeDefinition);
				}, []);
			},
			variants() {
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
						return { ...oVariant, variantReference: oVariant.variantManagementReference };
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
		var oComponent = Component.getComponentById(mPropertyBag.componentId);
		mPropertyBag.componentData ||= (oComponent && oComponent.getComponentData()) || {};
		mPropertyBag.manifest ||= mPropertyBag.rawManifest || (oComponent && oComponent.getManifestObject()) || {};
		mPropertyBag.reference ||= ManifestUtils.getFlexReference(mPropertyBag);
		const oFlexInfoSession = FlexInfoSession.getByReference(mPropertyBag.reference);
		mPropertyBag.version ||= oFlexInfoSession.version;
		mPropertyBag.adaptationId ||= oFlexInfoSession.displayedAdaptationId;
		mPropertyBag.allContextsProvided ||= oFlexInfoSession.allContextsProvided;
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
		mPropertyBag.reference = sReference;
		var oUpdate = runInitialPreparation(sMapName, mPropertyBag);
		if (oUpdate) {
			updateInstance(sReference, oUpdate);
		}
	}

	var oFlexObjectsDataSelector = new DataSelector({
		id: "flexObjects",
		parameterKey: "reference",
		executeFunction(oData, mParameters) {
			if (!_mInstances[mParameters.reference]) {
				return [];
			}
			var oPersistence = _mInstances[mParameters.reference].runtimePersistence;
			return oPersistence.flexObjects.concat(
				oPersistence.runtimeOnlyData.flexObjects || [],
				_mExternalData.flexObjects[mParameters.reference][_mInstances[mParameters.reference].componentId] || []
			);
		}
	});

	const oAppDescriptorChangesDataSelector = new DataSelector({
		id: "appDescriptorChanges",
		parentDataSelector: oFlexObjectsDataSelector,
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter((oFlexObject) => {
				return oFlexObject.isA(sAppDescriptorNamespace);
			});
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantType && oUpdateInfo.updatedObject?.isA(sAppDescriptorNamespace);
		}
	});

	const oAnnotationChangesDataSelector = new DataSelector({
		id: "annotationChanges",
		parentDataSelector: oFlexObjectsDataSelector,
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter((oFlexObject) => {
				return oFlexObject.isA(sAnnotationNamespace);
			});
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantType && oUpdateInfo.updatedObject?.isA(sAnnotationNamespace);
		}
	});

	function getInstanceEntryOrThrowError(sReference, sMapName) {
		if (!_mInstances[sReference]) {
			initializeEmptyState(sReference);
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

	function getCompVariantsMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "compVariants");
	}

	function buildRuntimePersistence(oFlexStateInstance, aExternalFlexObjects) {
		const oStorageResponse = oFlexStateInstance.storageResponse;
		var oRuntimePersistence = {
			flexObjects: createFlexObjects(oStorageResponse),
			runtimeOnlyData: {
				flexObjects: []
			}
		};
		Object.keys(_mFlexObjectInfo).forEach(function(sMapName) {
			var oUpdate = runInitialPreparation(sMapName, {
				storageResponse: oStorageResponse,
				externalData: aExternalFlexObjects,
				flexObjects: oRuntimePersistence.flexObjects,
				componentId: oFlexStateInstance.componentId
			});
			if (oUpdate) {
				oRuntimePersistence = merge(oRuntimePersistence, oUpdate);
			}
		});
		return oRuntimePersistence;
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

		_mInstances[sReference].runtimePersistence = {
			...oRuntimePersistence,
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
				const sErrorText = "Error updating runtime persistence: storage returned unknown flex objects";
				Log.error(sErrorText);
				throw new Error(sErrorText);
			})
		};

		// If the final length is different, an object is no longer there (e.g. new version requested)
		if (iInitialFlexObjectsLength !== _mInstances[sReference].runtimePersistence.flexObjects.length) {
			bUpdate = true;
		}

		return bUpdate;
	}

	function initializeNewInstance(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var bDataUpdated = false;
		if (!_mInstances[sReference].componentData && mPropertyBag.componentId) {
			var oComponent = Component.getComponentById(mPropertyBag.componentId);
			_mInstances[sReference].componentData = oComponent ? oComponent.getComponentData() : mPropertyBag.componentData;
			bDataUpdated = true;
		}
		if (!_mInstances[sReference].storageResponse) {
			_mInstances[sReference].storageResponse = filterByMaxLayer(sReference, _mInstances[sReference].unfilteredStorageResponse);
			_mInstances[sReference].maxLayer = FlexInfoSession.getByReference(sReference).maxLayer;
			// Flex objects need to be recreated
			delete _mInstances[sReference].runtimePersistence;
			bDataUpdated = true;
		}

		if (!ObjectPath.get(["flexObjects", sReference, mPropertyBag.componentId], _mExternalData)) {
			ObjectPath.set(["flexObjects", sReference, mPropertyBag.componentId], [], _mExternalData);
		}

		if (!_mInstances[sReference].runtimePersistence) {
			_mInstances[sReference].runtimePersistence = buildRuntimePersistence(
				_mInstances[sReference],
				_mExternalData.flexObjects[sReference][mPropertyBag.componentId] || []
			);
			bDataUpdated = true;
		}

		if (bDataUpdated) {
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	}

	function filterByMaxLayer(sReference, mResponse) {
		const mFilteredReturn = merge({}, mResponse);
		const mFlexObjects = mFilteredReturn.changes;
		if (LayerUtils.isLayerFilteringRequired(sReference)) {
			const oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			each(_mFlexObjectInfo, function(iIndex, mFlexObjectInfo) {
				mFlexObjectInfo.pathInResponse.forEach(function(sPath) {
					const aFilterByMaxLayer = ObjectPath.get(sPath, mFlexObjects).filter(function(oChangeDefinition) {
						return !oChangeDefinition.layer || !LayerUtils.isOverLayer(oChangeDefinition.layer, oFlexInfoSession.maxLayer);
					});
					ObjectPath.set(sPath, aFilterByMaxLayer, mFlexObjects);
				});
			});
		}
		return mFilteredReturn;
	}

	async function loadFlexData(mPropertyBag) {
		const mResponse = await Loader.loadFlexData(mPropertyBag);
		if (!mPropertyBag.partialFlexState) {
			mResponse.authors = await Loader.loadVariantsAuthors(mPropertyBag.reference);
		}
		// The following line is used by the Flex Support Tool to set breakpoints - please adjust the tool if you change it!
		_mInstances[mPropertyBag.reference] = merge({}, {
			unfilteredStorageResponse: mResponse,
			preparedMaps: {},
			componentId: mPropertyBag.componentId,
			componentData: mPropertyBag.componentData,
			partialFlexState: mPropertyBag.partialFlexState,
			version: mPropertyBag.version,
			allContextsProvided: mPropertyBag.allContextsProvided
		});

		storeInfoInSession(mPropertyBag.reference, mResponse);

		// no further changes to storageResponse properties allowed
		Object.freeze(_mInstances[mPropertyBag.reference].storageResponse);
		Object.freeze(_mInstances[mPropertyBag.reference].unfilteredStorageResponse);
		return mResponse;
	}

	function storeInfoInSession(sReference, mResponse) {
		var oResponse = mResponse && mResponse.changes || {};
		var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		if (oResponse.info !== undefined) {
			oFlexInfoSession = { ...oFlexInfoSession, ...oResponse.info };
		}
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);
	}

	function checkPartialFlexState(mInitProperties) {
		var oFlexInstance = _mInstances[mInitProperties.reference];
		if (oFlexInstance.partialFlexState === true && mInitProperties.partialFlexState !== true) {
			oFlexInstance.partialFlexState = false;
			mInitProperties.partialFlexData = merge({}, oFlexInstance.unfilteredStorageResponse.changes);
			mInitProperties.reInitialize = true;
		}
	}

	function checkComponentId(mInitProperties) {
		var sFlexInstanceComponentId = _mInstances[mInitProperties.reference].componentId;
		// if the component with the same reference was rendered with a new ID - clear existing state
		if (!mInitProperties.reInitialize && sFlexInstanceComponentId !== mInitProperties.componentId) {
			mInitProperties.reInitialize = true;
		}
	}

	function checkVersionAndAllContexts(mInitProperties) {
		var sFlexInstanceVersion = _mInstances[mInitProperties.reference].version;
		if (!mInitProperties.reInitialize && sFlexInstanceVersion !== mInitProperties.version) {
			mInitProperties.reInitialize = true;
		}

		const bFlexInstanceAllContexts = _mInstances[mInitProperties.reference].allContextsProvided;
		if (!mInitProperties.reInitialize && bFlexInstanceAllContexts !== mInitProperties.allContextsProvided) {
			mInitProperties.reInitialize = true;
		}
	}

	function rebuildResponseIfMaxLayerChanged(sReference) {
		if (_mInstances[sReference]?.maxLayer !== FlexInfoSession.getByReference(sReference).maxLayer) {
			FlexState.rebuildFilteredResponse(sReference);
		}
	}

	function initializeEmptyState(sReference) {
		_mInstances[sReference] = {
			unfilteredStorageResponse: { changes: StorageUtils.getEmptyFlexDataResponse() },
			storageResponse: { changes: StorageUtils.getEmptyFlexDataResponse() },
			preparedMaps: {},
			emptyState: true,
			// this makes sure that a proper initialize will still work as expected
			reInitialize: true,
			componentId: ""
		};
		const oNewInitPromise = new Deferred();
		_mInitPromises[sReference] = oNewInitPromise;
		oNewInitPromise.resolve();
		initializeNewInstance({ reference: sReference });
	}

	FlexState.getRuntimeOnlyData = function(sReference) {
		if (!_mInstances[sReference]) {
			initializeEmptyState(sReference);
		}
		return _mInstances[sReference].runtimePersistence.runtimeOnlyData;
	};

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
	FlexState.initialize = async function(mPropertyBag) {
		const mProperties = merge({}, mPropertyBag);
		enhancePropertyBag(mProperties);
		const sFlexReference = mProperties.reference;

		const oOldInitPromise = _mInitPromises[sFlexReference];
		const oNewInitPromise = new Deferred();
		_mInitPromises[sFlexReference] = oNewInitPromise;

		if (oOldInitPromise) {
			await oOldInitPromise.promise;
			checkPartialFlexState(mProperties);
			checkComponentId(mProperties);
			checkVersionAndAllContexts(mProperties);
			if (mProperties.reInitialize) {
				await loadFlexData(mProperties);
			} else {
				rebuildResponseIfMaxLayerChanged(mPropertyBag.reference);
			}
		} else {
			await loadFlexData(mProperties);
		}

		initializeNewInstance(mProperties);
		oNewInitPromise.resolve();
	};

	/**
	 * Waits until the FlexState is initialized
	 * This is only necessary if <code>FlexState.initialize</code> cannot be called directly
	 * due to missing information for the backend request (e.g. asyncHints)
	 *
	 * @param {string} sFlexReference - Flex reference of the app
	 * @returns {Promise<undefined>} Promise that resolves as soon as FlexState is initialized
	 */
	FlexState.waitForInitialization = function(sFlexReference) {
		const oInitPromise = _mInitPromises[sFlexReference]?.promise;
		if (!oInitPromise) {
			Log.error("FlexState.waitForInitialization was called before FlexState.initialize");
			return Promise.resolve();
		}
		return oInitPromise;
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
	FlexState.update = async function(mPropertyBag) {
		enhancePropertyBag(mPropertyBag);
		var sReference = mPropertyBag.reference;
		var oCurrentRuntimePersistence = _mInstances[sReference].runtimePersistence;

		const oOldInitPromise = _mInitPromises[sReference].promise;
		const oNewInitPromise = new Deferred();
		_mInitPromises[sReference] = oNewInitPromise;
		await oOldInitPromise;
		await loadFlexData(mPropertyBag);
		_mInstances[sReference].storageResponse = filterByMaxLayer(sReference, _mInstances[sReference].unfilteredStorageResponse);
		_mInstances[sReference].maxLayer = FlexInfoSession.getByReference(sReference).maxLayer;
		var bUpdated = updateRuntimePersistence(
			sReference,
			_mInstances[sReference].storageResponse,
			oCurrentRuntimePersistence
		);
		if (bUpdated) {
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
		oNewInitPromise.resolve();
	};

	function getChangeCategory(oChangeDefinition) {
		switch (oChangeDefinition.fileType) {
			case "change":
				if (oChangeDefinition.selector && oChangeDefinition.selector.persistencyKey) {
					return ["comp", "changes"];
				}
				if (oChangeDefinition.variantReference) {
					return "variantDependentControlChanges";
				}
				return "changes";
			case "ctrl_variant":
				return "variants";
			case "ctrl_variant_change":
				return "variantChanges";
			case "ctrl_variant_management_change":
				return "variantManagementChanges";
			case "variant":
				return ["comp", "variants"];
			case "annotation_change":
				return "annotationChanges";
			default:
				return "";
		}
	}

	/**
	 * Some save operations don't require a complete new data request, so the storage response gets a live update.
	 * This will also update the runtime persistence.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {object[]} aUpdates - All new FlexObjects in JSON format
	 */
	FlexState.updateStorageResponse = function(sReference, aUpdates) {
		const aFlexObjectUpdates = [];
		aUpdates.forEach((oUpdate) => {
			if (oUpdate.type === "ui2") {
				_mInstances[sReference].unfilteredStorageResponse.changes.ui2personalization = oUpdate.newData;
			} else {
				const vPath = getChangeCategory(oUpdate.flexObject);
				const sFileName = oUpdate.flexObject.fileName;
				const aUnfiltered = ObjectPath.get(vPath, _mInstances[sReference].unfilteredStorageResponse.changes);
				const aFiltered = ObjectPath.get(vPath, _mInstances[sReference].storageResponse.changes);
				const iExistingFlexObjectIdx = _mInstances[sReference].runtimePersistence.flexObjects.findIndex(
					(oFlexObject) => oFlexObject.getId() === sFileName
				);
				const oExistingFlexObject = _mInstances[sReference].runtimePersistence.flexObjects[iExistingFlexObjectIdx];
				switch (oUpdate.type) {
					case "add":
						aUnfiltered.push(oUpdate.flexObject);
						aFiltered.push(oUpdate.flexObject);
						if (iExistingFlexObjectIdx < 0) {
							throw new Error("Flex response includes unknown flex object");
						}
						break;
					case "delete":
						aFiltered.splice(aFiltered.findIndex((oFlexObject) => oFlexObject.fileName === sFileName), 1);
						aUnfiltered.splice(aUnfiltered.findIndex((oFlexObject) => oFlexObject.fileName === sFileName), 1);
						if (iExistingFlexObjectIdx >= 0) {
							_mInstances[sReference].runtimePersistence.flexObjects.splice(iExistingFlexObjectIdx, 1);
							aFlexObjectUpdates.push({ type: "removeFlexObject", updatedObject: oExistingFlexObject });
						}
						break;
					case "update":
						aFiltered.splice(aFiltered.findIndex((oFlexObject) => oFlexObject.fileName === sFileName), 1, oUpdate.flexObject);
						aUnfiltered.splice(
							aUnfiltered.findIndex((oFlexObject) => oFlexObject.fileName === sFileName),
							1,
							oUpdate.flexObject
						);
						if (oExistingFlexObject && oExistingFlexObject.getState() !== States.LifecycleState.PERSISTED) {
							oExistingFlexObject.setResponse(oUpdate.flexObject);
							aFlexObjectUpdates.push({ type: "updateFlexObject", updatedObject: oExistingFlexObject });
						}
						break;
					default:
				}
			}
		});
		if (aFlexObjectUpdates.length > 0) {
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference }, aFlexObjectUpdates);
		}
	};

	FlexState.clearState = function(sReference) {
		if (sReference) {
			delete _mInstances[sReference];
			delete _mInitPromises[sReference];
			oFlexObjectsDataSelector.clearCachedResult({ reference: sReference });
		} else {
			_mInstances = {};
			_mInitPromises = {};
			oFlexObjectsDataSelector.clearCachedResult();
		}
	};

	FlexState.setInitialNonFlCompVariantData = function(sReference, sPersistencyKey, oStandardVariant, aVariants, sSVMControlId) {
		_mExternalData.compVariants[sReference] ||= {};
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
		// with setting the state to persisted it is made sure that they not show up as a dirty flex object
		oFlexObject.setState(States.LifecycleState.PERSISTED);
		_mExternalData.flexObjects[sReference] ||= {};
		_mExternalData.flexObjects[sReference][sComponentId] ||= [];
		_mExternalData.flexObjects[sReference][sComponentId].push(oFlexObject);
		oFlexObjectsDataSelector.checkUpdate(
			{ reference: sReference },
			[{ type: "addFlexObject", updatedObject: oFlexObject }]
		);
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
			_mInstances[sReference].storageResponse = filterByMaxLayer(sReference, _mInstances[sReference].unfilteredStorageResponse);
			_mInstances[sReference].maxLayer = FlexInfoSession.getByReference(sReference).maxLayer;
			// Storage response has changed, recreate the flex objects
			_mInstances[sReference].runtimePersistence = buildRuntimePersistence(
				_mInstances[sReference],
				_mExternalData.flexObjects[sReference][_mInstances[sReference].componentId] || []
			);
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	};

	/**
	 * Adds a list of dirty flex objects to the flex state.
	 *
	 * @param {string} sReference - Flexibility reference of the app
	 * @param {array.<sap.ui.fl.apply._internal.flexObjects.FlexObject>} aFlexObjects - Flex objects
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} The flex objects that were added
	 */
	FlexState.addDirtyFlexObjects = function(sReference, aFlexObjects) {
		if (!_mInstances[sReference]) {
			initializeEmptyState(sReference);
		}
		const sAdaptationLayer = FlexInfoSession.getByReference(sReference).adaptationLayer;
		const aFilteredFlexObjects = aFlexObjects
		.filter((oFlexObject) => !sAdaptationLayer || !LayerUtils.isOverLayer(oFlexObject.getLayer(), sAdaptationLayer))
		.filter((oFlexObject) => (
			!_mInstances[sReference].runtimePersistence.flexObjects
			.some((oExistingFlexObject) => (oExistingFlexObject.getId() === oFlexObject.getId()))
		));

		if (aFilteredFlexObjects.length > 0) {
			_mInstances[sReference].runtimePersistence.flexObjects =
				_mInstances[sReference].runtimePersistence.flexObjects.concat(aFilteredFlexObjects);
			oFlexObjectsDataSelector.checkUpdate(
				{ reference: sReference },
				aFilteredFlexObjects.map(function(oFlexObject) {
					return { type: "addFlexObject", updatedObject: oFlexObject };
				})
			);
		}

		return aFilteredFlexObjects;
	};

	FlexState.removeDirtyFlexObjects = function(sReference, aFlexObjects) {
		const aRemovedFlexObjects = [];
		// FIXME: Currently called from the ChangePersistence which might be
		// independent of FlexState in some test cases
		// Once the ChangePersistence is no longer used
		// make sure to remove the safeguard
		if (_mInstances[sReference] && aFlexObjects.length > 0) {
			const aCurrentFlexObjects = _mInstances[sReference].runtimePersistence.flexObjects;
			aFlexObjects.forEach(function(oFlexObject) {
				const iIndex = aCurrentFlexObjects.indexOf(oFlexObject);
				if (iIndex >= 0) {
					aRemovedFlexObjects.push(oFlexObject);
					aCurrentFlexObjects.splice(iIndex, 1);
				}
			});
			if (aRemovedFlexObjects.length > 0) {
				oFlexObjectsDataSelector.checkUpdate(
					{ reference: sReference },
					aFlexObjects.map(function(oFlexObject) {
						return { type: "removeFlexObject", updatedObject: oFlexObject };
					})
				);
			}
		}
		return aRemovedFlexObjects;
	};

	FlexState.getComponentIdForReference = function(sReference) {
		return _mInstances[sReference]?.componentId;
	};

	FlexState.getFlexObjectsDataSelector = function() {
		return oFlexObjectsDataSelector;
	};

	FlexState.getAppDescriptorChanges = function(sReference) {
		return oAppDescriptorChangesDataSelector.get({ reference: sReference });
	};

	FlexState.getAnnotationChanges = function(sReference) {
		return oAnnotationChangesDataSelector.get({ reference: sReference });
	};

	FlexState.getUI2Personalization = function(sReference) {
		return merge({}, _mInstances[sReference].unfilteredStorageResponse.changes.ui2personalization);
	};

	FlexState.getCompVariantsMap = function(sReference) {
		return getCompVariantsMap(sReference);
	};

	FlexState.callPrepareFunction = function(sMapName, mPropertyBag) {
		return _mFlexObjectInfo[sMapName].prepareFunction(mPropertyBag);
	};

	// temporary function until ChangePersistence.getChangesForComponent is gone
	// TODO: also used by the CompVariantState to mutate the storage response, this has to be changed
	FlexState.getStorageResponse = function(sReference) {
		if (_mInitPromises[sReference]) {
			return _mInitPromises[sReference].promise.then(function() {
				return _mInstances[sReference].unfilteredStorageResponse;
			});
		}
		return Promise.resolve();
	};

	FlexState.getComponentData = function(sReference) {
		return _mInstances[sReference] && _mInstances[sReference].componentData;
	};

	return FlexState;
});
