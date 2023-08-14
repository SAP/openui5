/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/comp/smartform/flexibility/changes/RenameField"
], function(RenameField) {
	"use strict";

	return {
		// new change handler
		renameField: {
			changeHandler: {
				applyChange(oChange, oControl, mPropertyBag) {
					var CHANGE_PROPERTY_NAME = "fieldLabel";
					var oTexts = oChange.getTexts();
					oTexts[CHANGE_PROPERTY_NAME].value = oTexts[CHANGE_PROPERTY_NAME].value.toUpperCase();
					return RenameField.applyChange(oChange, oControl, mPropertyBag);
				},
				completeChangeContent(oChange, mSpecificChangeInfo, mPropertyBag) {
					return RenameField.completeChangeContent(oChange, mSpecificChangeInfo, mPropertyBag);
				},
				revertChange(oChange, oControl, mPropertyBag) {
					return RenameField.revertChange(oChange, oControl, mPropertyBag);
				}
			}
		}
	};
});