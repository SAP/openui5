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
				mProperties[oCondenserInfo.uniqueKey] = [oChange];
				oChange.condenserState = "select";
			} else {
				oChange.condenserState = "delete";
			}
		}
	};
});