/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/prepareMap",
	"sap/base/util/merge"
], function(
	prepareMap,
	merge
) {
	"use strict";
	var _instances = {};

	/**
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 *  {
	 *      variantsMap: {}
	 *      changesMap: {},
	 *      appDescriptorMap: {},
	 *      state: {}
	 *  }
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.Utils
	 * @experimental
	 * @since 1.73
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	return {
		initMaps: function (mPropertyBag) {
			if (!_instances[mPropertyBag.reference]) {
				_instances[mPropertyBag.reference] = {};
			}
			if (!_instances[mPropertyBag.reference].state) {
				merge(
					_instances[mPropertyBag.reference],
					prepareMap(mPropertyBag),
					{state: mPropertyBag.flexResponse}
				);
			}
		},

		getState: function (sReference) {
			if (_instances[sReference]) {
				return _instances[sReference].state;
			}
		},

		clearStates: function () {
			_instances = {};
		},

		clearState: function (sReference) {
			if (_instances[sReference]) {
				_instances[sReference] = {};
			}
		},

		getVariantsMap: function (sReference) {
			if (_instances[sReference]) {
				return _instances[sReference].variantsMap;
			}
		},

		getChangesMap: function (sReference) {
			if (_instances[sReference]) {
				return _instances[sReference].changesMap;
			}
		},

		getAppDescriptorMap: function (sReference) {
			if (_instances[sReference]) {
				return _instances[sReference].appDescriptorMap;
			}
		}
	};
}, true);
