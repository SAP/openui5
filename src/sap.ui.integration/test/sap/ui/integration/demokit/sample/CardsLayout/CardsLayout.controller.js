sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageToast",
	"sap/ui/integration/library"
], function (Controller, JSONModel, DateFormat, MessageToast, integrationLibrary) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.CardsLayout.CardsLayout", {

		onInit: function () {
			var cardManifests = new JSONModel(),
				componentCardUrl = sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/componentCard/manifest.json"),
				homeIconUrl = sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/images/CompanyLogo.png"),
				date = DateFormat.getDateInstance({style: "long"}).format(new Date());

			cardManifests.loadData(sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/model/cardManifests.json"));

			this.getView().setModel(cardManifests, "manifests");
			this.getView().setModel(new JSONModel({
				componentCardUrl: componentCardUrl,
				homeIconUrl: homeIconUrl,
				date: date
			}));
		},

		onAction: function (oEvent) {
			if (oEvent.getParameter("type") === integrationLibrary.CardActionType.Navigation) {
				MessageToast.show("URL: " + oEvent.getParameter("parameters").url);
			}
		}

	});
});
