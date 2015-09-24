sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var BlockController = Controller.extend("sap.ui.layout.sample.BlockLayoutDefault.Block", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		onSliderMoved: function (event) {
			var value = event.getParameter("value");
			this.getView().byId("containerLayout").setWidth(value + "%");
		}
	});

	return BlockController;

});
