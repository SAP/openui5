sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/Device'
	], function(jQuery, Controller, JSONModel, Device) {
	"use strict";


	var TableController = Controller.extend("sap.m.sample.Table.Table", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onAfterRendering: function () {
			var oMessageStrip = this.getView().byId("idMessageStrip");
			if (Device.system.phone) {
				oMessageStrip.setVisible(false);
			} else {
				oMessageStrip.setVisible(true);
			}
		}
	});


	return TableController;
});