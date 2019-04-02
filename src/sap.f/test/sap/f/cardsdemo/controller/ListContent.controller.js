sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ListController", {
		onInit: function () {
			var cardManifests = new JSONModel();

			cardManifests.loadData(sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/listContent/manifest.json"));
			this.getView().setModel(cardManifests, "manifests");

			this._createParamsModel();
		},
		_createParamsModel: function () {
			var oData = {
				"location": {
					"city": "Sofia",
					"country": "Bulgaria"
				},
				"locationCity" : {
					"city": "Sofia"
				},
				"locationOverwrite" : {
					"city": "Vratza"
				},
				"weather": {
					"city": "Vratza"
				}
			};
			var oModel = new JSONModel();
			oModel.setData(oData);
			this.getView().setModel(oModel, "params");
		},
		changeCity: function (oEvent) {

			var Card = sap.ui.getCore().byId("container-cardsplayground---listContent--weatherCard"),
				sCity = oEvent.getSource().getText(),
				oCity = "",
				sButtonText = "";

			if (sCity.indexOf("Waldorf") > -1) {
				oCity = {"city": "Waldorf,de"};
				sButtonText = "Get weather in Vratza";
			} else {
				sButtonText = "Get weather in Waldorf";
				oCity = {"city": "Vratza"};
			}
			oEvent.getSource().setText(sButtonText);
			Card.setParameters(oCity);
		},
		onFormFactorChange: function (oEvent) {
			document.getElementsByClassName("sapFGridContainer")[0].classList.toggle("sapUiSizeCompact");
		}
	});
});