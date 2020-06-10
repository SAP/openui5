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
				var aChanges = [];
				aChanges.push(oChange);
				mProperties.set(sUniqueKey, aChanges);
			}
		}
	};
});