sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/fiori/library"
], function(Controller, JSONModel, webcFioriLib) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.FlexibleColumnLayout.C", {

		onInit: function() {
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(this.oModel, 'products');

			this.FCLLayout = webcFioriLib.FCLLayout;
		},
		handleMidClose: function(oEvent) {
			this.getView().byId("fcl").setLayout(this.FCLLayout.StartColumnFullScreen);
		},
		handleEndClose: function(oEvent) {
			this.getView().byId("fcl").setLayout(this.FCLLayout.TwoColumnsMidExpanded);
		},
		onStartColumnListItemPress: function(oEvent) {
			var selectedItemId = oEvent.getParameter('item').getDescription();
			this.getView().byId("fcl").setLayout(this.FCLLayout.TwoColumnsMidExpanded);

			this.oModel.setProperty("/selectedProduct", this.oModel.getData().ProductCollection.find(function (oProduct) {
				return oProduct.ProductId === selectedItemId;
			}));
		},
		onMidColumnListItemPress: function(oEvent) {
			this.getView().byId("fcl").setLayout(this.FCLLayout.ThreeColumnsEndExpanded);
		}
	});
});