/*
 * ! ${copyright}
 */

sap.ui.define([

], function(
) {
	"use strict";
	/**
	 * Object containing attributes of a change, along with the control to which this change should be applied.
	 *
	 * @typedef {object} sap.ui.fl.apply._internal.flexState.prepareMap.map
	 * @since 1.73
	 * @private
	 * @ui5-restricted
	 * @property {object} variantsMap - Variants map
	 * @property {object} changesMap - Changes map
	 * @property {object} appDescriptorMap - App descriptor map
	 */

	/**
	 * Prepares the map from the flex response for the passed flex state
	 *
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.flexResponse - Flex response
	 * @param {object} [mPropertyBag.technicalParameters] - Technical parameters
	 *
	 * @returns {sap.ui.fl.apply._internal.flexState.prepareMap.map}
	 *
	 * @experimental since 1.73
	 * @function
	 * @since 1.73
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/apply/_internal/flexState/prepareMap
	 */
	return function(/*mPropertyBag*/) {
		return {
			variantsMap: {},
			changesMap: {},
			appDescriptorMap: {}
		};
	};
});
