sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../services/SampleServices"
], function (Controller, JSONModel, SampleServices) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Main", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			var oView = this.getView();

			oView.setModel(new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/model/examples.json")), "cardTypesExamples");
			oView.setModel(new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/model/cardManifests.json")), "manifests");
			oView.setModel(new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/model/analyticalContentManifests.json")), "analyticalContentManifests");
			oView.setModel(new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/model/listContentManifests.json")), "listContentManifests");
		},

		onAfterRendering: function () {
			// debugger
		},

		onSelectExample: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContextPath();
			var sRoute = this.getView().getModel("cardTypesExamples").getProperty(sPath + "/route");
			this.oRouter.navTo(sRoute);
		}

	});
});