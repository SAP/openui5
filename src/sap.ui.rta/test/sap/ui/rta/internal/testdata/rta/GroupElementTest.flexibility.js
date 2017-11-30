/*!
 * ${copyright}
 */

sap.ui.define([
	"/sap/ui/comp/smartform/flexibility/changes/RenameField"
], function (RenameField) {
	"use strict";

	return {
		//new change handler
		"renameField": {
			"changeHandler": {
				applyChange : function(oChange, oControl, mPropertyBag) {
					var CHANGE_PROPERTY_NAME = "fieldLabel";
					var oChangeDefinition = oChange.getDefinition();
					oChangeDefinition.texts[CHANGE_PROPERTY_NAME].value = oChangeDefinition.texts[CHANGE_PROPERTY_NAME].value.toUpperCase();
					return RenameField.applyChange(oChange, oControl, mPropertyBag);
				},
				completeChangeContent : function(oChange, mSpecificChangeInfo, mPropertyBag){
					return RenameField.completeChangeContent(oChange, mSpecificChangeInfo, mPropertyBag);
				}
			}
		}
	};
});