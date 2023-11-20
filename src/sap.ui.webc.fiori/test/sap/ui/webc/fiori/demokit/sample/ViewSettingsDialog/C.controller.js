sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.ViewSettingsDialog.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		onAfterRendering: function() {
			this.getView().byId("vsdButton").setAccessibilityAttributes({
				hasPopup: "true"
			});
		},
		handleCancel: function() {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event cancel fired.");
			demoToast.show();
		},
		handleConfirm: function() {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event confirm fired.");
			demoToast.show();
		},
		handleOpenButtonClick: function() {
			var oVSD = this.getView().byId("viewSettingsDialogExample");
			oVSD.show();
		}

	});
});