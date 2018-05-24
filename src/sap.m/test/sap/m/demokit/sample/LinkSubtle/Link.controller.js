sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageBox, Controller, JSONModel) {
	"use strict";

	var LinkController = Controller.extend("sap.m.sample.LinkSubtle.Link", {

		handleLinkPress: function (evt) {
			jQuery.sap.require("sap.m.MessageBox");
			MessageBox.alert("Link was clicked!");
		},

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		}

	});


	return LinkController;

});