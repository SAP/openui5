/*!
 * ${copyright}
 */

// Provides helper sap.ui.unified.FileUploaderHelper.
sap.ui.define([
	'sap/ui/core/Lib'
], function(
	Library
) {
	"use strict";

	var oMLibraryLoad = {
		createTextField: function(sId){
			var oTextField = new sap.m.Input(sId);
			return oTextField;
		},
		setTextFieldContent: function(oTextField, sWidth){
			oTextField.setWidth(sWidth);
		},
		createButton: function(sId){
			var oButton = new sap.m.Button(sId);
			return oButton;
		},
		addFormClass: function(){ return "sapUiFUM"; }
	};

	var oCommonsLibraryLoad = {
		createTextField: function(sId){
			var oTextField = new sap.ui.commons.TextField(sId);
			return oTextField;
		},
		setTextFieldContent: function(oTextField, sWidth){
			oTextField.setWidth(sWidth);
		},
		createButton: function(sId){
			var oButton = new sap.ui.commons.Button(sId);
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