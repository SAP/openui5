/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/each"
], function(
	each
) {
	"use strict";

	return {
		/**
		 * Adds a Update change to the map with reduced changes.
		 * The last Update change always wins, so all others can be deleted.
		 *
		 * @param {Map} mProperties - Map with all reduced changes
		 * @param {string} oCondenserInfo - Condenser information
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
		 */
		addToChangesMap(mProperties, oCondenserInfo, oChange) {
			if (!mProperties[oCondenserInfo.uniqueKey]) {
				oCondenserInfo.change = oChange;
				mProperties[oCondenserInfo.uniqueKey] = oCondenserInfo;
				oChange.condenserState = "select";
			} else {
				oChange.condenserState = "delete";
			}
		},

		getChangesFromMap(mObjects, sUniqueKey) {
			var aChanges = [];
			each(mObjects[sUniqueKey], function(sKey, oCondenserInfo) {
				aChanges.push(oCondenserInfo.change);
			});
			return aChanges;
		}
	};
});