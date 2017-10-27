sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListSelection.List", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		handleSelectChange: function (oEvent) {
			var mode = oEvent.getParameter("selectedItem").getKey();
			this.byId("ProductList").setMode(mode);
		}

	});


	return ListController;

});
