/*!
 * ${copyright}
 */

sap.ui.define([
], function(

) {
	"use strict";

	return {
		addToChangesMap: function(mProperties, sUniqueKey, oChange) {
			if (!mProperties[sUniqueKey]) {
				mProperties[sUniqueKey] = [oChange];
			}
		}
	};
});