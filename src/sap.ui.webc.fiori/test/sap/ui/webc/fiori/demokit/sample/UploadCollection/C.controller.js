sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.UploadCollection.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleDrop: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event drop fired.");
			demoToast.show();
		},
		handleItemDelete: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemDelete fired.");
			demoToast.show();
		},
		handleSelectionChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event selectionChange fired.");
			demoToast.show();
		}

	});
});