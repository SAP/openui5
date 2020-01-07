sap.ui.define([ 'jquery.sap.global', 'sap/m/MessageToast', 'sap/m/MessageBox', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel' ],
	function(jQuery, MessageToast, MessageBox, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.HeaderContainerOH.Page", {
		onInit: function() {
			var oModel = new JSONModel("test-resources/sap/ui/documentation/sdk/products.json");
			this.getView().setModel(oModel);
		},

		press: function (evt) {
			MessageBox.alert("Link was clicked!");
		}
	});

	return PageController;
});