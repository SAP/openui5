/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap",
	"sap/ui/fl/apply/_internal/flexState/prepareChangesMap",
	"sap/ui/fl/apply/_internal/flexState/prepareVariantsMap",
	"sap/ui/fl/Utils"
], function(
	merge,
	Component,
	ConnectorUtils,
	Loader,
	ManifestUtils,
	prepareAppDescriptorMap,
	prepareChangesMap,
	prepareVariantsMap,
	Utils
) {
	"use strict";

	/**
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 *  {
	 *      appDescriptorMap: {},
	 *      changesMap: {},
	 *      variantsMap: {},
	 *      storageResponse: {},
	 *      componentId: "<componentId>"
	 *  }
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

		if (!_mInstances[sReference][sMapName]) {
			var mPropertyBag = {
				storageResponse: _mInstances[sReference].storageResponse,
				componentId: _mInstances[sReference].componentId
			};
			_mInstances[sReference][sMapName] = FlexState._callPrepareFunction(sMapName, mPropertyBag);
		}

		return _mInstances[sReference][sMapName];
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
				storageResponse: {changes: ConnectorUtils.getEmptyFlexDataResponse()},
				componentId: mPropertyBag.componentId
			});
			_mInitPromises[sReferenceWithoutComponent] = _mInitPromises[mPropertyBag.reference];
		}
	}

	function rePrepareMaps(aPreviousKeys, mPropertyBag) {
		var aMapNames = aPreviousKeys.filter(function(sKey) {
			return sKey === "variantsMap" || sKey === "changesMap" || sKey === "appDescriptorMap";
		});

		aMapNames.forEach(function (sMapName) {
			_mInstances[mPropertyBag.reference][sMapName] = FlexState._callPrepareFunction(sMapName, {
				storageResponse: _mInstances[mPropertyBag.reference].storageResponse,
				componentId: mPropertyBag.componentId
			});
		});
	}

	function loadFlexData(mPropertyBag) {
		_mInitPromises[mPropertyBag.reference] = Loader.loadFlexData(mPropertyBag)
			.then(function (mResponse) {
				_mInstances[mPropertyBag.reference] = merge({}, {
					storageResponse: mResponse,
					componentId: mPropertyBag.componentId
				});

				// temporarily create an instance without '.Component'
				// TODO remove as soon as both with and without '.Component' are harmonized
				createSecondInstanceIfNecessary(mPropertyBag);

				// no further changes to storageResponse properties allowed
				// TODO enable the Object.freeze as soon as its possible
				// Object.freeze(_mInstances[mPropertyBag.reference].storageResponse);
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
	 * @returns {promise<undefined>} Resolves a promise as soon as FlexState is initialized
	 */
	FlexState.initialize = function (mPropertyBag) {
		enhancePropertyBag(mPropertyBag);
		// if the component with the same reference was rendered with a new ID - clear existing state
		if (_mInitPromises[mPropertyBag.reference]) {
			return _mInitPromises[mPropertyBag.reference]
				.then(function (mPropertyBag) {
					if (_mInstances[mPropertyBag.reference].componentId === mPropertyBag.componentId) {
						return;
					}
					return loadFlexData(mPropertyBag);
				}.bind(null, mPropertyBag));
		}

		return loadFlexData(mPropertyBag);
	};

	/**
	 * Clears the cache and then triggeres a call to the backend to fetch new data
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

		var aPreviousResponseKeys = _mInstances[mPropertyBag.reference] ? Object.keys(_mInstances[mPropertyBag.reference]) : [];

		FlexState.clearState(mPropertyBag.reference);

		return FlexState.initialize(mPropertyBag)
			.then(rePrepareMaps.bind(null, aPreviousResponseKeys, mPropertyBag));
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

	FlexState.getUIChanges = function(sReference) {
		return getChangesMap(sReference).changes;
	};

	FlexState.getAppDescriptorChanges = function(sReference) {
		return getAppDescriptorMap(sReference).appDescriptorChanges;
	};

	FlexState.getVariantsState = function(sReference) {
		return getVariantsMap(sReference);
	};

	FlexState._callPrepareFunction = function(sMapName, mPropertyBag) {
		return _mPrepareFunctions[sMapName](mPropertyBag);
	};

	// temporary function until ChangePersistence.getChangesForComponent is gone
	FlexState.getStorageResponse = function(sReference) {
		if (_mInitPromises[sReference]) {
			return _mInitPromises[sReference].then(function() {
				return _mInstances[sReference].storageResponse;
			});
		}
	};
	// temporary function until the maps are ready
	FlexState.getFlexObjectsFromStorageResponse = function(sReference) {
		return _mInstances[sReference].storageResponse.changes;
	};

	return FlexState;
}, true);
