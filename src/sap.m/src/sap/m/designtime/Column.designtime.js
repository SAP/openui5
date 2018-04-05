/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/ElementUtil"
], function (Utils) {
	"use strict";

	return {
		isVisible: function(oColumn) {
			return oColumn.getVisible();
		},
		actions: {
			remove: "hideControl",
			reveal: {
				changeType: "unhideControl",
				getLabel: function(oControl) {
					return Utils.getLabelForElement(oControl.getHeader());
				}
			}
		}
	};
}, /* bExport= */ false);
