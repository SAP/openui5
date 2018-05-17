sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'./Formatter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Formatter, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ObjectListItem.List", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onListItemPress: function (evt) {
			MessageToast.show("Pressed : " + evt.getSource().getTitle());
		}
	});


	return ListController;

});