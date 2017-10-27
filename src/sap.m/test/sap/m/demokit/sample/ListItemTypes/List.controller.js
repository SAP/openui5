sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListItemTypes.List", {

		onInit : function(evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		handleSelectChange : function(oEvent) {
			var type = oEvent.getParameter("selectedItem").getKey();
			this.byId("ProductList").getItems().forEach(function(item) {
				item.setType(type);
			});
		},

		handlePress : function(oEvent) {
			MessageToast.show("'press' event fired!");
		},

		handleDetailPress : function(oEvent) {
			MessageToast.show("'detailPress' event fired!");
		}

	});


	return ListController;

});
