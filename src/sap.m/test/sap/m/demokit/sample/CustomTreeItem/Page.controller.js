sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.CustomTreeItem.Page", {
		onInit: function(evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel("test-resources/sap/m/demokit/sample/CustomTreeItem/Tree.json");
			this.getView().setModel(oModel);
		},

		handleButtonPress: function(evt) {
			MessageToast.show("Button pressed");
		}

	});

	return PageController;

});
