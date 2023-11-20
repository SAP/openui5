sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageToast",
	"sap/ui/integration/library",
	"sap/ui/core/date/UI5Date"
], function (Controller, JSONModel, DateFormat, MessageToast, integrationLibrary, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.CardsLayout.CardsLayout", {

		onInit: function () {
			var cardManifests = new JSONModel(),
				homeIconUrl = sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/images/CompanyLogo.png"),
				date = DateFormat.getDateInstance({style: "long"}).format(UI5Date.getInstance());

			cardManifests.loadData(sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/model/cardManifests.json"));

			this.getView().setModel(cardManifests, "manifests");
			this.getView().setModel(new JSONModel({
				homeIconUrl: homeIconUrl,
				date: date
			}));
		},

		onAction: function (oEvent) {
			if (oEvent.getParameter("type") === integrationLibrary.CardActionType.Navigation) {
				MessageToast.show("URL: " + oEvent.getParameter("parameters").url);
			}
		},

		resolveCardUrl: function (sUrl) {
			return sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/" + sUrl);
		}

	});
});
