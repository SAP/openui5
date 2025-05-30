sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ParametersController", {

		onInit: function () {
			var oCardManifests = new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/listContent/manifests.json"));
			this.getView().setModel(oCardManifests, "manifests");

			this._createParamsModel();
		},

		_createParamsModel: function () {
			var oModel = new JSONModel({
				"location": {
					"city": "Sofia",
					"country": "Bulgaria"
				},
				"locationCity": {
					"city": "Sofia"
				},
				"locationOverwrite": {
					"city": "Vratza"
				},
				"weather": {
					"city": "Vratza"
				}
			});
			this.getView().setModel(oModel, "params");
		},

		onChangeCity: function (oEvent) {
			var oCard = this.byId("weatherCard"),
				sCity = oEvent.getSource().getText(),
				oCity = "",
				sButtonText = "";

			if (sCity.indexOf("Walldorf") > -1) {
				oCity = { "city": "Walldorf, DE" };
				sButtonText = "Get weather in Vratza";
			} else {
				sButtonText = "Get weather in Walldorf";
				oCity = { "city": "Vratza" };
			}
			oEvent.getSource().setText(sButtonText);
			oCard.setParameters(oCity);
		}
	});
});