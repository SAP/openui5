sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/enum/EditMode"
], function(
	Controller,
	oCore,
	JSONModel,
	EditMode
	) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.FieldCustomContent.Controller", {

		onInit: function() {
			var oView = this.getView();
			oView.bindElement("/Books(1)");
			oCore.getMessageManager().registerObject(oView, true);

			var oViewModel = new JSONModel({
				editMode: EditMode.Editable
			});
			oView.setModel(oViewModel, "view");

		},

		formatEditMode: function(sEditMode) {
			if (sEditMode === EditMode.Editable) {
				return true;
			} else {
				return false;
			}
		}

	});
});
