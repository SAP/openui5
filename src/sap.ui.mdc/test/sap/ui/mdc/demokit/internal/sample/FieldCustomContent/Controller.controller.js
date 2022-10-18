sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/enum/EditMode",
	"sap/m/MessageToast"
], function(
	Controller,
	oCore,
	JSONModel,
	EditMode,
	MessageToast
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
		},

		formatDisplayOnly: function(sEditMode) {
			if (sEditMode === EditMode.Display) {
				return true;
			} else {
				return false;
			}
		},

		handleChange: function(oEvent) {
			var oField = oEvent.getSource();
			var oPromise = oEvent.getParameter("promise");

			if (oPromise) {
				oPromise.then(function(vValue) {
					MessageToast.show("Change " + oField.getId() + "; value: " + vValue);
				}).catch(function(oError) {
					MessageToast.show(oError.message);
				});
			}
		}

	});
});
