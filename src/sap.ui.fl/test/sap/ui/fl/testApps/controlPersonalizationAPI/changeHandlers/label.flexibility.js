/*!
 * ${copyright}
 */

sap.ui.define([
], function () {
	"use strict";

	return {
		//new change handler
		changeLabel: {
			changeHandler: {
				applyChange: function(oChange, oControl) {
					oControl.setText(oControl.getText() + " X");
				},
				completeChangeContent: function(oChange) {
					oChange;
				},
				revertChange: function(oChange, oControl) {
					var sText = oControl.getText();
					oControl.setText(sText.substring(0, sText.length - 2));
				}
			}
		}
	};
});