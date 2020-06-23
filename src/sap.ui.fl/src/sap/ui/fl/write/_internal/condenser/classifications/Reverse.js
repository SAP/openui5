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
		addToChangesMap: function(mProperties, sUniqueKey, oChange) {
			if (!mProperties[sUniqueKey]) {
				mProperties[sUniqueKey] = [];
			}
			mProperties[sUniqueKey].push(oChange);
		},
		getChangesFromMap: function(mObjects, aChanges, sKey) {
			each(mObjects[sKey], function(sKey, aReverseChanges) {
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