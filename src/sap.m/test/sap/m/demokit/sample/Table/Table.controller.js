sap.ui.define([
		'jquery.sap.global',
		'./Formatter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Formatter, Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.Table.Table", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		}
	});


	return TableController;

});
