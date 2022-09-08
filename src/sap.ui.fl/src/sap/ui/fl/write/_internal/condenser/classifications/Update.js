/*!
 * ${copyright}
 */

sap.ui.define([
], function(

) {
	"use strict";

	return {
		/**
		 * Adds a Update change to the map with reduced changes.
		 * The last Update change always wins, so all others can be deleted.
		 *
		 * @param {Map} mProperties - Map with all reduced changes
		 * @param {string} oCondenserInfo - Condenser information
		 * @param {sap.ui.fl.Change} oChange - Change instance
		 */
		addToChangesMap: function(mProperties, oCondenserInfo, oChange) {
			if (!mProperties[oCondenserInfo.uniqueKey]) {
				oCondenserInfo.change = oChange;
				mProperties[oCondenserInfo.uniqueKey] = oCondenserInfo;
				oChange.condenserState = "select";
			} else {
				oChange.condenserState = "delete";
			}
		}
	};
});