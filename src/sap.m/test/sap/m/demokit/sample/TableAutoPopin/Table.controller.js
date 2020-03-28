sap.ui.define([
	"./Formatter",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Formatter, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.TableAutoPopin.Table", {
		formatter: Formatter,

		onInit: function() {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onSliderMoved: function(oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("idProductsTable").setWidth(fValue + "%");
		}


	});

});