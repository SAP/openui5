sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.List.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleItemClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemClick fired.");
			demoToast.show();
		},
		handleItemClose: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemClose fired.");
			demoToast.show();
		},
		handleItemDelete: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemDelete fired.");
			demoToast.show();
		},
		handleItemToggle: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemToggle fired.");
			demoToast.show();
		},
		handleLoadMore: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event loadMore fired.");
			demoToast.show();
		},
		handleSelectionChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event selectionChange fired.");
			demoToast.show();
		}

	});
});