/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap",
	"sap/ui/fl/apply/_internal/flexState/prepareChangesMap",
	"sap/ui/fl/apply/_internal/flexState/prepareVariantsMap",
	"sap/ui/fl/Utils"
], function(
	merge,
	Loader,
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

	/**
	 * Initializes the FlexState for a given reference. A request for the flex data is sent to the Loader and the response is saved.
	 * The FlexState can only be initialized once, every subsequent init call will just resolve as soon as it is initialized.
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.reference - Reference of the app
	 * @param {object} mPropertyBag.component - Information about the component
	 * @param {string} mPropertyBag.component.name - Name of the component
	 * @param {string} mPropertyBag.component.id - ID of the component
	 * @param {string} [mPropertyBag.component.appName] - Name where bundled changes from the application development are stored
	 * @param {string} [mPropertyBag.component.appVersion] - Current running version of application
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.siteId] - <code>siteId</code> that belongs to actual component
	 * @param {string} [mPropertyBag.cacheKey] - Key to validate the client side stored cache entry
	 * @returns {promise<undefined>} Resolves a promise as soon as FlexState is initialized
	 */
	FlexState.initForReference = function (mPropertyBag) {
		if (!mPropertyBag.reference) {
			throw Error("Please pass a reference to initialize a FlexState");
		}

		if (_mInitPromises[mPropertyBag.reference]) {
			return _mInitPromises[mPropertyBag.reference];
		}

		mPropertyBag.component.appVersion = mPropertyBag.component.appVersion || Utils.DEFAULT_APP_VERSION;
		_mInitPromises[mPropertyBag.reference] = Loader.loadFlexData(mPropertyBag)
		.then(function(mResponse) {
			_mInstances[mPropertyBag.reference] = merge({}, {
				storageResponse: mResponse,
				componentId: mPropertyBag.component.id
			});
			// no further changes to storageResponse properties allowed
			Object.freeze(_mInstances[mPropertyBag.reference].storageResponse);
		});

		return _mInitPromises[mPropertyBag.reference];
	};

	// only temporary
	FlexState._initForReferenceWithData = function(mPropertyBag) {
		if (!mPropertyBag.reference) {
			throw Error("Please pass a reference to initialize a FlexState");
		}

		if (_mInstances[mPropertyBag.reference]) {
			throw Error("the state for the given reference is already initialized");
		}
		_mInstances[mPropertyBag.reference] = merge({}, {
			storageResponse: mPropertyBag.storageResponse,
			componentId: mPropertyBag.component.id
		});
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

	// just a proposal
	FlexState.getAppDescriptorChanges = function(sReference) {
		return getAppDescriptorMap(sReference).appDescriptorChanges;
	};

	FlexState.getVariantsState = function(sReference) {
		return getVariantsMap(sReference);
	};

	FlexState._callPrepareFunction = function(sMapName, mPropertyBag) {
		return _mPrepareFunctions[sMapName](mPropertyBag);
	};

	return FlexState;
}, true);
