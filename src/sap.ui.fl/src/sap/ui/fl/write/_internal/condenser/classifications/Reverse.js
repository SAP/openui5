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
		 * Adds a Reverse change to the map with reduced changes.
		 *
		 * @param {Map} mProperties - Map with all reduced changes
		 * @param {string} oCondenserInfo - Condenser information
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
		 */
		addToChangesMap(mProperties, oCondenserInfo, oChange) {
			mProperties[oCondenserInfo.uniqueKey] ||= [];
			mProperties[oCondenserInfo.uniqueKey].push(oChange);
		},

		/**
		 * Iterates the changes of classification 'reverse' and returns only the necessary changes.
		 *
		 * @param {Map} mObjects - Map with all reduced changes
		 * @param {string} sUniqueKey - Unique key defined in the condenser information
		 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} All necessary reverse changes
		 */
		getChangesFromMap(mObjects, sUniqueKey) {
			var aChanges = [];
			each(mObjects[sUniqueKey], function(sKey, aReverseChanges) {
				aReverseChanges.reverse();
				var oChange;
				aReverseChanges.forEach(function(oCurrentChange, index) {
					if (oChange && oChange.getChangeType() !== oCurrentChange.getChangeType()) {
						oChange = null;
						aReverseChanges[index].condenserState = "delete";
						aReverseChanges[index - 1].condenserState = "delete";
					} else {
						oChange = oCurrentChange;
						if (index > 0) {
							aReverseChanges[index - 1].condenserState = "delete";
						}
						aReverseChanges[index].condenserState = "select";
					}
				});

				if (oChange) {
					aChanges.push(oChange);
				}
			});
			return aChanges;
		}
	};
});