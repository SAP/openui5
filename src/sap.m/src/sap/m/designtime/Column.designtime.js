/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	return {
		isVisible: function(oColumn) {
			return oColumn.getVisible();
		},
		actions: {
			remove: "hideControl",
			reveal : "unhideControl"
		}
	};
}, /* bExport= */ false);