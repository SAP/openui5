sap.ui.define([ 'jquery.sap.global', 'sap/m/MessageToast', 'sap/ui/core/mvc/Controller' ],
	function(jQuery, MessageToast, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.HeaderContainerOH.Page", {
		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
			this.getView().setModel(oModel);
		},

		press: function (evt) {
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.alert("Link was clicked!");
		},
	});

	return PageController;
});