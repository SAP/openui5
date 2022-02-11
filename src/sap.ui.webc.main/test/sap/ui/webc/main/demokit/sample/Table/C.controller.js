sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Table.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleLoadMore: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event loadMore fired.");
			demoToast.show();
		},
		handlePopinChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event popinChange fired.");
			demoToast.show();
		},
		handleRowClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event rowClick fired.");
			demoToast.show();
		},
		handleSelectionChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event selectionChange fired.");
			demoToast.show();
		}

	});
});