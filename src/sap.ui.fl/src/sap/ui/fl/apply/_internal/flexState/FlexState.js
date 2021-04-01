/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/appDescriptorChanges/prepareAppDescriptorMap",
	"sap/ui/fl/apply/_internal/flexState/changes/prepareChangesMap",
	"sap/ui/fl/apply/_internal/flexState/compVariants/prepareCompVariantsMap",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/prepareVariantsMap",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	each,
	merge,
	ObjectPath,
	Log,
	Component,
	prepareAppDescriptorMap,
	prepareChangesMap,
	prepareCompVariantsMap,
	prepareVariantsMap,
	Loader,
	ManifestUtils,
	StorageUtils,
	LayerUtils,
	Utils
) {
	"use strict";

	/**
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 *	{
	 * 		appDescriptorMap: {},
	 * 		changesMap: {},
	 * 		variantsMap: {},
	 * 		compVariantsMap: {},
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
	 *		partialFlexState: <boolean>,
	 *		componentId: "<componentId>"
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
	var _mFlexObjectInfo = {
		appDescriptorChanges: {
			prepareFunction: prepareAppDescriptorMap,
			pathInResponse: []
		},
		changes: {
			prepareFunction: prepareChangesMap,
			pathInResponse: ["changes"]
		},
		variants: {
			prepareFunction: prepareVariantsMap,
			pathInResponse: ["variants", "variantChanges", "variantDependentControlChanges", "variantManagementChanges"]
		},
		compVariants: {
			prepareFunction: prepareCompVariantsMap,
			pathInResponse: ["comp.variants", "comp.standardVariants", "comp.defaultVariants", "comp.changes"]
		}
	};

	function updateComponentData(mPropertyBag) {
		var oComponent = Component.get(mPropertyBag.componentId);
		_mInstances[mPropertyBag.reference].componentData = oComponent ? oComponent.getComponentData() : mPropertyBag.componentData;
	}

	function enhancePropertyBag(mPropertyBag) {
		var oComponent = Component.get(mPropertyBag.componentId);
		mPropertyBag.componentData = mPropertyBag.componentData || oComponent.getComponentData() || {};
		mPropertyBag.manifest = mPropertyBag.manifest || mPropertyBag.rawManifest || oComponent.getManifestObject();
		mPropertyBag.reference = mPropertyBag.reference || ManifestUtils.getFlexReference(mPropertyBag);
	}

	function getInstanceEntryOrThrowError(sReference, sMapName) {
		if (!_mInstances[sReference]) {
			throw new Error("State is not yet initialized");
		}

		if (!_mInstances[sReference].preparedMaps[sMapName]) {
			var mPropertyBag = {
				unfilteredStorageResponse: _mInstances[sReference].unfilteredStorageResponse,
				storageResponse: _mInstances[sReference].storageResponse,
				componentId: _mInstances[sReference].componentId,
				componentData: _mInstances[sReference].componentData
			};
			_mInstances[sReference].preparedMaps[sMapName] = FlexState.callPrepareFunction(sMapName, mPropertyBag);
		}

		return _mInstances[sReference].preparedMaps[sMapName];
	}

	function getAppDescriptorMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "appDescriptorChanges");
	}

	function getChangesMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "changes");
	}

	function getVariantsMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "variants");
	}

	function getCompVariantsMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "compVariants");
	}

	function createSecondInstanceIfNecessary(mPropertyBag) {
		if (mPropertyBag.reference.endsWith(".Component")) {
			var aParts = mPropertyBag.reference.split(".");
			aParts.pop();
			var sReferenceWithoutComponent = aParts.join(".");
			_mInstances[sReferenceWithoutComponent] = merge({}, {
				storageResponse: {changes: StorageUtils.getEmptyFlexDataResponse()},
				unfilteredStorageResponse: {changes: StorageUtils.getEmptyFlexDataResponse()},
				preparedMaps: {},
				componentId: mPropertyBag.componentId,
				partialFlexState: mPropertyBag.partialFlexState
			});
			_mInitPromises[sReferenceWithoutComponent] = _mInitPromises[mPropertyBag.reference];
		}
	}

	// TODO turn into utility or put it somewhere central
	function filterByMaxLayer(mResponse) {
		var mFilteredReturn = merge({}, mResponse);
		var mFlexObjects = mFilteredReturn.changes;
		if (LayerUtils.isLayerFilteringRequired()) {
			each(_mFlexObjectInfo, function(iIndex, mFlexObjectInfo) {
				mFlexObjectInfo.pathInResponse.forEach(function(sPath) {
					ObjectPath.set(sPath, LayerUtils.filterChangeDefinitionsByMaxLayer(ObjectPath.get(sPath, mFlexObjects)), mFlexObjects);
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

				// temporarily create an instance without '.Component'
				// TODO remove as soon as both with and without '.Component' are harmonized
				createSecondInstanceIfNecessary(mPropertyBag);
				registerMaxLayerHandler(mPropertyBag.reference);

				// no further changes to storageResponse properties allowed
				// TODO enable the Object.freeze as soon as its possible
				// Object.freeze(_mInstances[mPropertyBag.reference].storageResponse);
				// Object.freeze(_mInstances[mPropertyBag.reference].unfilteredStorageResponse);
				return mResponse;
			});

		return _mInitPromises[mPropertyBag.reference];
	}

	function registerMaxLayerHandler(sReference) {
		Utils.ifUShellContainerThen(function(aServices) {
			_mNavigationHandlers[sReference] = handleMaxLayerChange.bind(null, sReference);
			aServices[0].registerNavigationFilter(_mNavigationHandlers[sReference]);
		}, ["ShellNavigation"]);
	}

	function deRegisterMaxLayerHandler(sReference) {
		Utils.ifUShellContainerThen(function(aServices) {
			if (_mNavigationHandlers[sReference]) {
				aServices[0].unregisterNavigationFilter(_mNavigationHandlers[sReference]);
				delete _mNavigationHandlers[sReference];
			}
		}, ["ShellNavigation"]);
	}

	function handleMaxLayerChange(sReference, sNewHash, sOldHash) {
		return Utils.ifUShellContainerThen(function(aServices) {
			try {
				var sCurrentMaxLayer = LayerUtils.getMaxLayerTechnicalParameter(sNewHash);
				var sPreviousMaxLayer = LayerUtils.getMaxLayerTechnicalParameter(sOldHash);
				if (sCurrentMaxLayer !== sPreviousMaxLayer) {
					FlexState.clearFilteredResponse(sReference);
				}
			} catch (oError) {
				// required to hinder any errors - can break FLP navigation
				Log.error(oError.message);
			}
			return aServices[0].NavigationFilterStatus.Continue;
		}, ["ShellNavigation"]);
	}

	function clearPreparedMaps(sReference) {
		_mInstances[sReference].preparedMaps = {};
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
	 * @param {number} [mPropertyBag.version] - Number of the version in which the state should be initialized
	 * @param {boolean} [mPropertyBag.partialFlexState=false] - if true state is initialized partially and does not include flex bundles
	 * @returns {promise<undefined>} Resolves a promise as soon as FlexState is initialized
	 */
	FlexState.initialize = function(mPropertyBag) {
		return Promise.resolve(mPropertyBag)
			.then(function(mInitProperties) {
				enhancePropertyBag(mInitProperties);
				var sFlexReference = mInitProperties.reference;

				if (_mInitPromises[sFlexReference]) {
					return _mInitPromises[sFlexReference]
						.then(checkPartialFlexState.bind(null, mInitProperties))
						.then(checkComponentId)
						.then(function(mEvaluatedProperties) {
							return mEvaluatedProperties.reInitialize
								? loadFlexData(mEvaluatedProperties)
								: _mInstances[sFlexReference].unfilteredStorageResponse;
						});
				}

				return loadFlexData(mInitProperties);
			})
			.then(function(mPropertyBag, mResponse) {
				// filtering should only be done once; can be reset via function
				if (!_mInstances[mPropertyBag.reference].storageResponse) {
					_mInstances[mPropertyBag.reference].storageResponse = filterByMaxLayer(mResponse);
					updateComponentData(mPropertyBag);
				}
			}.bind(null, mPropertyBag));
	};

	/**
	 * Clears the cache and then triggers a call to the backend to fetch new data
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.componentId - ID of the component
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @param {object} [mPropertyBag.manifest] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.componentData] - Component data of the current component
	 * @param {number} [mPropertyBag.version] - Number of the version in which the state should be initialized
	 * @returns {promise<undefined>} Resolves a promise as soon as FlexState is initialized again
	 */
	FlexState.clearAndInitialize = function(mPropertyBag) {
		enhancePropertyBag(mPropertyBag);

		FlexState.clearState(mPropertyBag.reference);
		FlexState.clearState(Utils.normalizeReference(mPropertyBag.reference));

		return FlexState.initialize(mPropertyBag);
	};

	FlexState.clearState = function(sReference) {
		if (sReference) {
			deRegisterMaxLayerHandler(sReference);
			delete _mInstances[sReference];
			delete _mInitPromises[sReference];
		} else {
			Object.keys(_mInstances).forEach(function(sReference) {
				deRegisterMaxLayerHandler(sReference);
			});
			_mInstances = {};
			_mInitPromises = {};
		}
	};

	/**
	 * Removes the saved filtered storage response and internal maps for the given reference.
	 * The next initialize call will add it again.
	 *
	 * @param {string} sReference - Flex reference of the app
	 */
	FlexState.clearFilteredResponse = function(sReference) {
		if (_mInstances[sReference]) {
			clearPreparedMaps(sReference);
			delete _mInstances[sReference].storageResponse;
		}
	};

	FlexState.getUIChanges = function(sReference) {
		return getChangesMap(sReference).changes;
	};

	FlexState.getAppDescriptorChanges = function(sReference) {
		return getAppDescriptorMap(sReference).appDescriptorChanges;
	};

	FlexState.getVariantsState = function(sReference) {
		return getVariantsMap(sReference);
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
	};
	// temporary function until the maps are ready
	FlexState.getFlexObjectsFromStorageResponse = function(sReference) {
		return _mInstances[sReference] && _mInstances[sReference].unfilteredStorageResponse.changes;
	};

	return FlexState;
}, true);
