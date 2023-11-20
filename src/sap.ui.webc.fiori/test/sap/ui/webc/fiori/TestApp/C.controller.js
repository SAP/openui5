sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.TestApp.C", {

		onInit: function() {
			var oModel = new JSONModel("./products.json");
			this.getView().setModel(oModel);
		},
		handleLayoutChange: function(oEvent) {

		},
		handleRowClick: function(oEvent) {

		},
		handleLoadMore: function(oEvent) {

		},
		handlePopinChange: function(oEvent) {

		}

	});
});