sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Tree.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleItemClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemClick fired.");
			demoToast.show();
		},
		handleItemDelete: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemDelete fired.");
			demoToast.show();
		},
		handleItemMouseout: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemMouseout fired.");
			demoToast.show();
		},
		handleItemMouseover: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemMouseover fired.");
			demoToast.show();
		},
		handleItemToggle: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemToggle fired.");
			demoToast.show();
		},
		handleSelectionChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event selectionChange fired.");
			demoToast.show();
		}

	});
});