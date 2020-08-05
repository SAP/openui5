/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Change"
], function(
	Change
) {
	"use strict";

	/**
	 * Prepares the AppDescriptorMap from the flex response
	 *
	 * @param {object} mPropertyBag
	 * @param {object} [mPropertyBag.storageResponse.changes.appDescriptorChanges] - All app descriptor changes
	 *
	 * @returns {object} The prepared map of App Descriptors
	 *
	 * @experimental since 1.74
	 * @function
	 * @since 1.74
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap
	 */
	return function(mPropertyBag) {
		var aChangeDefinitions = mPropertyBag.storageResponse.changes.appDescriptorChanges || [];
		//TODO: add filtering for condensable changeTypes once necessary

		var aChanges = aChangeDefinitions.map(function(oChangeDefinition) {
			return new Change(oChangeDefinition);
		});
		return {
			appDescriptorChanges: aChanges
		};
	};
});
