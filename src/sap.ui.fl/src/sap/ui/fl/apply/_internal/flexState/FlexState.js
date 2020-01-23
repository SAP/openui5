/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap",
	"sap/ui/fl/apply/_internal/flexState/prepareChangesMap",
	"sap/ui/fl/apply/_internal/flexState/prepareVariantsMap",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	merge,
	ObjectPath,
	Component,
	StorageUtils,
	Loader,
	prepareAppDescriptorMap,
	prepareChangesMap,
	prepareVariantsMap,
	LayerUtils,
	Utils
) {
	"use strict";

	/**
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 * 	{
	 * 		appDescriptorMap: {},
	 * 		changesMap: {},
	 * 		variantsMap: {},
	 * 		storageResponse: {
	 * 			changes: {
	 * 				changes: [...],
	 * 				variants: [...],
	 * 				variantChanges: [...],
	 * 				variantDependentControlChanges: [...],
	 * 				variantManagementChanges: [...],
	 * 				ui2personalization: {...},
	 * 			},
	 * 			loadModules: <boolean>
	 * 		}},
	 * 		componentId: "<componentId>"
	 * 	}
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
	var _mInitPromises = {};
	var _mPrepareFunctions = {
		appDescriptorMap: prepareAppDescriptorMap,
		changesMap: prepareChangesMap,
		variantsMap: prepareVariantsMap
	};

	function enhancePropertyBag(mPropertyBag) {
		var oComponent = Component.get(mPropertyBag.componentId);
		mPropertyBag.componentData = mPropertyBag.componentData || oComponent.getComponentData() || {};
		mPropertyBag.manifest = mPropertyBag.manifest || mPropertyBag.rawManifest || oComponent.getManifestObject();

		// cannot use ManifestUtils.getFlexReference(mPropertyBag), since it doesn't comply with previous implementation of ChangePersistence component name
		mPropertyBag.reference = mPropertyBag.reference || Utils.getComponentClassName(oComponent);
	}

	function getInstanceEntryOrThrowError(sReference, sMapName) {
		if (!_mInstances[sReference]) {
			throw Error("State is not yet initialized");
		}

		if (!_mInstances[sReference].preparedMaps[sMapName]) {
			var mPropertyBag = {
				storageResponse: _mInstances[sReference].unfilteredStorageResponse,
				componentId: _mInstances[sReference].componentId
			};
			_mInstances[sReference].preparedMaps[sMapName] = FlexState._callPrepareFunction(sMapName, mPropertyBag);
		}

		return _mInstances[sReference].preparedMaps[sMapName];
	}

	function getAppDescriptorMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "appDescriptorMap");
	}

	function getChangesMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "changesMap");
	}

	function getVariantsMap(sReference) {
		return getInstanceEntryOrThrowError(sReference, "variantsMap");
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
				componentId: mPropertyBag.componentId
			});
			_mInitPromises[sReferenceWithoutComponent] = _mInitPromises[mPropertyBag.reference];
		}
	}

	function filterByMaxLayer(mResponse) {
		var mFilteredReturn = merge({}, mResponse);
		var mFlexObjects = mFilteredReturn.changes;
		// TODO turn into utility or put it somewhere central
		var aFilterableTypes = ["changes", "variants", "variantChanges", "variantDependentControlChanges", "variantManagementChanges"];
		if (LayerUtils.isLayerFilteringRequired()) {
			aFilterableTypes.forEach(function(sType) {
				mFlexObjects[sType] = LayerUtils.filterChangeDefinitionsByMaxLayer(mFlexObjects[sType]);
			});
		}
		return mFilteredReturn;
	}

	function loadFlexData(mPropertyBag) {
		_mInitPromises[mPropertyBag.reference] = Loader.loadFlexData(mPropertyBag)
			.then(function (mResponse) {
				_mInstances[mPropertyBag.reference] = merge({}, {
					unfilteredStorageResponse: mResponse,
					preparedMaps: {},
					componentId: mPropertyBag.componentId
				});

				// temporarily create an instance without '.Component'
				// TODO remove as soon as both with and without '.Component' are harmonized
				createSecondInstanceIfNecessary(mPropertyBag);

				// no further changes to storageResponse properties allowed
				// TODO enable the Object.freeze as soon as its possible
				// Object.freeze(_mInstances[mPropertyBag.reference].storageResponse);
				// Object.freeze(_mInstances[mPropertyBag.reference].unfilteredStorageResponse);
				return mResponse;
			});

		return _mInitPromises[mPropertyBag.reference];
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
	 * @param {string} [mPropertyBag.draftLayer] - Layer for which the draft should be loaded
	 * @returns {promise<undefined>} Resolves a promise as soon as FlexState is initialized
	 */
	FlexState.initialize = function (mPropertyBag) {
		return Promise.resolve().then(function(mPropertyBag) {
			enhancePropertyBag(mPropertyBag);

			if (_mInitPromises[mPropertyBag.reference]) {
				return _mInitPromises[mPropertyBag.reference].then(function (mPropertyBag) {
					// if the component with the same reference was rendered with a new ID - clear existing state
					if (_mInstances[mPropertyBag.reference].componentId !== mPropertyBag.componentId) {
						return loadFlexData(mPropertyBag);
					}
					return _mInstances[mPropertyBag.reference].unfilteredStorageResponse;
				}.bind(null, mPropertyBag));
			}

			return loadFlexData(mPropertyBag);
		}.bind(null, mPropertyBag))
		.then(function(mPropertyBag, mResponse) {
			// filtering should only be done once; can be reset via function
			if (!_mInstances[mPropertyBag.reference].storageResponse) {
				_mInstances[mPropertyBag.reference].storageResponse = filterByMaxLayer(mResponse);
			}
			//for the time being ensure variantSection is available, remove once everyone is asking for getVariantState
			FlexState.getVariantsState(mPropertyBag.reference);
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
	 * @returns {promise<undefined>} Resolves a promise as soon as FlexState is initialized again
	 */
	FlexState.clearAndInitialize = function(mPropertyBag) {
		enhancePropertyBag(mPropertyBag);
		var bVariantsMapExists = !!ObjectPath.get(["preparedMaps", "variantsMap"], _mInstances[mPropertyBag.reference]);

		FlexState.clearState(mPropertyBag.reference);

		return FlexState.initialize(mPropertyBag)
			.then(function(bVariantsMapExists, sReference) {
				if (bVariantsMapExists) {
					return FlexState.getVariantsState(sReference);
				}
			}.bind(null, bVariantsMapExists, mPropertyBag.reference));
	};

	FlexState.clearState = function (sReference) {
		if (sReference) {
			delete _mInstances[sReference];
			delete _mInitPromises[sReference];
		} else {
			_mInstances = {};
			_mInitPromises = {};
		}
	};

	/**
	 * Removes the saved filtered storage response and internal maps for the given reference;
	 * The next initialize call will add it again
	 *
	 * @param {string} sReference - Flex reference of the app
	 */
	FlexState.clearMaxLayerFiltering = function(sReference) {
		delete _mInstances[sReference].storageResponse;
		FlexState.clearPreparedMaps(sReference);
	};

	FlexState.getUIChanges = function(sReference) {
		return getChangesMap(sReference).changes;
	};

	FlexState.getAppDescriptorChanges = function(sReference) {
		return getAppDescriptorMap(sReference).appDescriptorChanges;
	};

	FlexState.getVariantsState = function(sReference) {
		var oVariantsMap = getVariantsMap(sReference);
		// temporary until ChangePersistence.getChangesForComponent is gone
		_mInstances[sReference].unfilteredStorageResponse.changes.variantSection = oVariantsMap;
		return oVariantsMap;
	};

	FlexState._callPrepareFunction = function(sMapName, mPropertyBag) {
		return _mPrepareFunctions[sMapName](mPropertyBag);
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
		return _mInstances[sReference].unfilteredStorageResponse.changes;
	};

	// temporary function until Variant Controller map is removed
	FlexState.clearPreparedMaps = function(sReference) {
		if (_mInstances[sReference]) {
			_mInstances[sReference].preparedMaps = {};
		}
	};

	return FlexState;
}, true);
