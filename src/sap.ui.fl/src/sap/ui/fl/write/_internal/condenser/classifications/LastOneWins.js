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
		 * @param {string} sUniqueKey - Unique key defined in the condenser information
		 * @param {sap.ui.fl.Change} oChange - Change instance
		 */
		addToChangesMap: function(mProperties, sUniqueKey, oChange) {
			if (!mProperties[sUniqueKey]) {
				mProperties[sUniqueKey] = [oChange];
				oChange.condenserState = "select";
			} else {
				oChange.condenserState = "delete";
			}
		}
	};
});