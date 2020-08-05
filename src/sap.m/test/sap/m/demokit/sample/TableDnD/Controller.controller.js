sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"./Utils"
], function(Controller, JSONModel, Utils) {
	"use strict";

	return Controller.extend("sap.m.sample.TableDnD.Controller", {

		onInit: function () {
			// set explored app's demo model on this sample
			this.oProductsModel = this.initSampleProductsModel();
			this.getView().setModel(this.oProductsModel);
		},

		onExit: function() {
			this.oProductsModel.destroy();
		},

		initSampleProductsModel: function() {
			var oData = jQuery.sap.sjax({
				url: sap.ui.require.toUrl("sap/ui/demo/mock/products.json"),
				dataType: "json"
			}).data;

			// prepare and initialize the rank property
			oData.ProductCollection.forEach(function(oProduct) {
				oProduct.Rank = Utils.ranking.Initial;
			}, this);

			var oModel = new JSONModel();
			oModel.setData(oData);
			return oModel;
		},

		moveToAvailableProductsTable: function() {
			this.byId("selectedProducts").getController().moveToAvailableProductsTable();
		},

		moveToSelectedProductsTable: function() {
			this.byId("availableProducts").getController().moveToSelectedProductsTable();
		}
	});

});