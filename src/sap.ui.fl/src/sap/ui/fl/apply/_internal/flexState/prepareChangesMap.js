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
	 * @experimental since 1.74
	 * @function
	 * @since 1.74
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/apply/_internal/flexState/prepareChangesMap
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for preparing the map
	 * @param {object} mPropertyBag.storageResponse - Storage response with the flex data
	 * @returns {object} The prepared map for changes
	 */
	return function(mPropertyBag) {
		var aChangeDefinitions = mPropertyBag.storageResponse.changes.changes;
		var aChanges = aChangeDefinitions.map(function(oChangeDefinition) {
			return new Change(oChangeDefinition);
		});
		// TODO create dependency map and return it
		return {
			changes: aChanges
		};
	};
});
