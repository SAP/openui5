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
	 * Prepares the ChangesMap from the flex response
	 *
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.flexResponse - Flex response
	 * @param {object} [mPropertyBag.technicalParameters] - Technical parameters
	 *
	 * @returns {object} The prepared map of changes
	 *
	 * @experimental since 1.74
	 * @function
	 * @since 1.74
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/apply/_internal/flexState/prepareChangesMap
	 */
	return function(mPropertyBag) {
		var aChangeDefinitions = mPropertyBag.storageResponse.changes.changes;
		var aChanges = aChangeDefinitions.map(function(oChangeDefinition) {
			return new Change(oChangeDefinition);
		});
		return {
			changes: aChanges
		};
	};
});
