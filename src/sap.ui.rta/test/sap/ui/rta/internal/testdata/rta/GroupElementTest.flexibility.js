/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/comp/smartform/flexibility/changes/RenameField"
], function (RenameField) {
	"use strict";

	return {
		//new change handler
		renameField: {
			changeHandler: {
				applyChange: function(oChange, oControl, mPropertyBag) {
					var CHANGE_PROPERTY_NAME = "fieldLabel";
					var oTexts = oChange.getTexts();
					oTexts[CHANGE_PROPERTY_NAME].value = oTexts[CHANGE_PROPERTY_NAME].value.toUpperCase();
					return RenameField.applyChange(oChange, oControl, mPropertyBag);
				},
				completeChangeContent: function(oChange, mSpecificChangeInfo, mPropertyBag) {
					return RenameField.completeChangeContent(oChange, mSpecificChangeInfo, mPropertyBag);
				},
				revertChange: function(oChange, oControl, mPropertyBag) {
					return RenameField.revertChange(oChange, oControl, mPropertyBag);
				}
			}
		}
	};
});