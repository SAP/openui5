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
			oView.setModel(new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/model/submitActionManifests.json")), "submitActionManifests");
		},

		onSelectExample: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContextPath();
			var sRoute = this.getView().getModel("cardTypesExamples").getProperty(sPath + "/route");
			this.oRouter.navTo(sRoute);
		},

		compareGroups: function (sGroup1, sGroup2) {
			// put "Card Type Examples" before "Card Actions"
			if (sGroup1 === "CARD TYPE EXAMPLES" && sGroup2 === "CARD ACTIONS") {
				return -1;
			}
			// put "Card Type Examples" before "Card Actions"
			if (sGroup1 === "CARD ACTIONS" && sGroup2 === "CARD TYPE EXAMPLES") {
				return 1;
			}

			// compare lexicographically
			if (sGroup1 < sGroup2) {
				return -1;
			} else if (sGroup1 === sGroup2) {
				return 0;
			} else {
				return 1;
			}
		}

	});
});