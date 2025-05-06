/*!
 * ${copyright}
 */

// Provides helper sap.ui.unified.FileUploaderHelper.
sap.ui.define([
	'sap/ui/core/Lib',
	"sap/m/Input",
	"sap/m/Button",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Button"
], function(
	Library,
	Input,
	Button,
	TextField,
	CommonsButton
) {
	"use strict";

	var oMLibraryLoad = {
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

	var oCommonsLibraryLoad = {
		createTextField: function(sId){
			var oTextField = new TextField(sId);
			return oTextField;
		},
		setTextFieldContent: function(oTextField, sWidth){
			oTextField.setWidth(sWidth);
		},
		createButton: function(sId){
			var oButton = new CommonsButton(sId);
			return oButton;
		},
		addFormClass: function(){ return "sapUiCFUM"; }
	};

	var oErrorLibraryLoad = {
		createTextField: function(sId){ throw new Error("no TextField control available!"); }, /* must return a TextField control */
		createTextFieldContent: function(oTextField, sWidth){ throw new Error("no TextField control available!"); },
		createButton: function(sId){ throw new Error("no Button control available!"); }, /* must return a Button control */
		addFormClass: function(){ return null; }
	};

	var FileUploaderHelper = {
		getHelper: function () {
			if (Library.isLoaded("sap.m")) {
				return oMLibraryLoad;
			} else if (Library.isLoaded("sap.ui.unified")) {
				return  oCommonsLibraryLoad;
			}

			return oErrorLibraryLoad;
		}
	};

	return FileUploaderHelper;
});