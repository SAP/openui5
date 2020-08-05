sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../services/SampleServices"
], function (Controller, JSONModel, SampleServices) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Main", {

		onInit: function () {
			var oView = this.getView();

			this.oRouter = this.getOwnerComponent().getRouter();

			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/model/examples.json"));
			oView.setModel(oModel, "cardTypesExamples");

			var oCardManifests = new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/model/cardManifests.json"));
			oView.setModel(oCardManifests, "manifests");
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