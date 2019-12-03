/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap",
	"sap/ui/fl/apply/_internal/flexState/prepareChangesMap",
	"sap/ui/fl/apply/_internal/flexState/prepareVariantsMap"
], function(
	merge,
	prepareAppDescriptorMap,
	prepareChangesMap,
	prepareVariantsMap
) {
	"use strict";
	var _instances = {};

	var oPrepareFunctions = {
		appDescriptorMap: prepareAppDescriptorMap,
		changesMap: prepareChangesMap,
		variantsMap: prepareVariantsMap
	};

	function getInstanceEntryOrThrowError(sReference, sMapName) {
		if (!_instances[sReference]) {
			throw Error("State is not yet initialized");
		}

		if (!_instances[sReference][sMapName]) {
			var mPropertyBag = {
				storageResponse: _instances[sReference].storageResponse
			};
			_instances[sReference][sMapName] = oPrepareFunctions[sMapName](mPropertyBag);
		}

		return _instances[sReference][sMapName];
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
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 *  {
	 *      appDescriptorMap: {},
	 *      changesMap: {},
	 *      variantsMap: {},
	 *      storageResponse: {}
	 *  }
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.FlexState
	 * @experimental
	 * @since 1.73
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	return {
		initForReference: function (mPropertyBag) {
			if (!mPropertyBag.reference) {
				throw Error("Please pass a reference to initialize a FlexState");
			}

			if (_instances[mPropertyBag.reference]) {
				throw Error("the state for the given reference is already initialized");
			}

			_instances[mPropertyBag.reference] = merge({}, {storageResponse: mPropertyBag.storageResponse});
			return _instances[mPropertyBag.reference];
		},

		// is this actually needed?
		// getStorageResponse: function (sReference) {
		// 	return getInstanceEntryOrThrowError(sReference, "storageResponse");
		// },

		clearState: function (sReference) {
			if (sReference) {
				if (_instances[sReference]) {
					delete _instances[sReference];
				}
			} else {
				_instances = {};
			}
		},

		getUiChanges: function(sReference) {
			return getChangesMap(sReference).changes;
		},

		// just a proposal
		getAppDescriptorChanges: function(sReference) {
			return getAppDescriptorMap(sReference).appDescriptorChanges;
		},

		// just a proposal
		getVariantsForVariantManagement: function(sReference, sVariantManagementId) {
			return getVariantsMap(sReference)[sVariantManagementId];
		}
	};
}, true);
