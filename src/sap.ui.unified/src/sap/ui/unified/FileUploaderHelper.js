/*!
 * ${copyright}
 */

// Provides helper sap.ui.unified.FileUploaderHelper.
sap.ui.define([
	'sap/m/Button',
	'sap/m/Input'
], function(
	Button,
	Input
) {
	"use strict";

	var FileUploaderHelper = {
		getHelper: function () {
			return {
				createTextField: function(sId){
					var oTextField = new Input(sId);
					return oTextField;
				},
				setTextFieldContent: function(oTextField, sWidth){
					oTextField.setWidth(sWidth);
				},
				createButton: function(sId){
					var oButton = new Button(sId);
					return oButton;
				},
				addFormClass: function(){ return "sapUiFUM"; }
			};
		}
	};

	return FileUploaderHelper;
});