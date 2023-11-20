/*!
 * ${copyright}
 */

sap.ui.define([
], function() {
	"use strict";

	return {
		// new change handler
		changeLabel: {
			changeHandler: {
				applyChange(oChange, oControl) {
					oControl.setText(`${oControl.getText()} X`);
				},
				completeChangeContent() {
				},
				revertChange(oChange, oControl) {
					var sText = oControl.getText();
					oControl.setText(sText.substring(0, sText.length - 2));
				}
			}
		}
	};
});