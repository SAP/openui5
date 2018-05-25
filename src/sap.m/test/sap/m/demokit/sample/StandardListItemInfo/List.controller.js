sap.ui.define([
		'jquery.sap.global',
		'./Formatter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Formatter, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.StandardListItemInfo.List", {

		onInit : function (evt) {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);

		}
	});


	return ListController;

});