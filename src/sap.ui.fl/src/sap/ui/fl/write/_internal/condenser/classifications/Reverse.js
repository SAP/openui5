/*!
 * ${copyright}
 */

sap.ui.define([
], function(

) {
	"use strict";

	return {
		addToChangesMap: function(mProperties, sUniqueKey, oChange) {
			if (!mProperties.has(sUniqueKey)) {
				mProperties.set(sUniqueKey, []);
			}
			var aChanges = mProperties.get(sUniqueKey);
			aChanges.push(oChange);
		},
		getChangesFromMap: function(mObjects, aChanges, sKey) {
			mObjects.get(sKey).forEach(function(aReverseChanges) {
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