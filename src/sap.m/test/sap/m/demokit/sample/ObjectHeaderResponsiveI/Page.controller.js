sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageBox, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ObjectHeaderResponsiveI.Page", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onPress: function (evt) {
			MessageBox.alert("Link was clicked!");
		}
	});


	return PageController;

});