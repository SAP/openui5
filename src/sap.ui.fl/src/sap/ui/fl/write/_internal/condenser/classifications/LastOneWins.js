/*!
 * ${copyright}
 */

sap.ui.define([
], function(

) {
	"use strict";

	return {
		/**
		 * Adds a LastOneWins change to the map with reduced changes if there is no change of that unique key already.
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
				mProperties[oCondenserInfo.uniqueKey].oldestChange = oChange;
				oChange.condenserState = "delete";
			}
		},

		getChangesFromMap(mObjects, sUniqueKey) {
			return Object.values(mObjects[sUniqueKey]).map((oCondenserInfo) => oCondenserInfo.change);
		}
	};
});