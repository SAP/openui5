sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	var oCitiesData = {
		selectedCity: 'London',
		cities: [
			{
				id: "London",
				name: "London"
			},
			{
				id: "Sofia",
				name: "Sofia"
			},
			{
				id: "Walldorf",
				name: "Walldorf"
			},
			{
				id: "Vratza",
				name: "Great City of Vratza"
			}
		]
	};

	return Controller.extend("sap.ui.integration.sample.CardParameters.CardParameters", {
		onInit: function () {
			var oCitiesModel = new JSONModel(oCitiesData);
			this.getView().setModel(oCitiesModel);

			var oParamsData = {
				"cityParam": {
					"city": "London"
				}
			};

			var oParamsModel = new JSONModel(oParamsData);

			this.getView().setModel(oParamsModel, "params");
		},

		onChangeCity: function (oEvent) {
			var oParamsData = {
				"cityParam": {
					"city": oEvent.getParameter('selectedItem').getKey()
				}
			};

			var oParamsModel = new JSONModel(oParamsData);

			this.getView().setModel(oParamsModel, "params");
		}
	});
});