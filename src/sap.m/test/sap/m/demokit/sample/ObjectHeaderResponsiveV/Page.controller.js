sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageBox, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ObjectHeaderResponsiveV.Page", {

		onInit: function() {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		onPress: function (evt) {
			jQuery.sap.require("sap.m.MessageBox");
			MessageBox.alert("Link was clicked!");
		},
	});


	return PageController;

});
