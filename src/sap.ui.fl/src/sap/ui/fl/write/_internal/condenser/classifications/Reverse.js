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
		 * @param {string} sUniqueKey - Unique key defined in the condenser information
		 * @param {sap.ui.fl.Change} oChange - Change instance
		 */
		addToChangesMap: function(mProperties, sUniqueKey, oChange) {
			if (!mProperties[sUniqueKey]) {
				mProperties[sUniqueKey] = [];
			}
			mProperties[sUniqueKey].push(oChange);
		},

		/**
		 *
		 * @param {Map} mObjects - Map with all reduced changes
		 * @param {sap.ui.fl.Change[]} aChanges - Changes instances
		 * @param {string} sUniqueKey - Unique key defined in the condenser information
		 */
		getChangesFromMap: function(mObjects, aChanges, sUniqueKey) {
			each(mObjects[sUniqueKey], function(sKey, aReverseChanges) {
				aReverseChanges.reverse();
				var oChange;
				aReverseChanges.forEach(function(oCurrentChange) {
					if (oChange && oChange.getChangeType() !== oCurrentChange.getChangeType()) {
						oChange = null;
					} else {
						oChange = oCurrentChange;
					}
				});

				if (oChange) {
					aChanges.push(oChange);
				}
			});
		}
	};
});