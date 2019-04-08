sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	var CardsLayoutController = Controller.extend("sap.ui.integration.sample.CardsLayout.CardsLayout", {
		onInit: function () {
			var cardManifests = new JSONModel();

			cardManifests.loadData(sap.ui.require.toUrl("sap/ui/integration/sample/AnalyticalCard/model/cardManifests.json"));
			this.getView().setModel(cardManifests, "manifests");

			var oModel = new JSONModel({
				"cities": [
					{
						"text": "Berlin",
						"key": "BR"
					},
					{
						"text": "London",
						"key": "LN"
					},
					{
						"text": "Madrid",
						"key": "MD"
					},
					{
						"text": "Prague",
						"key": "PR"
					},
					{
						"text": "Paris",
						"key": "PS"
					},
					{
						"text": "Sofia",
						"key": "SF"
					},
					{
						"text": "Vienna",
						"key": "VN"
					}
				],
				"productItems": [
					{
						"title": "Notebook HT",
						"subtitle": "ID23452256-D44",
						"revenue": "27.25K EUR",
						"status": "success",
						"statusSchema": 8
					},
					{
						"title": "Notebook XT",
						"subtitle": "ID27852256-D47",
						"revenue": "7.35K EUR",
						"status": "exceeded",
						"statusSchema": 3
					},
					{
						"title": "Notebook ST",
						"subtitle": "ID123555587-I05",
						"revenue": "22.89K EUR",
						"status": "warning",
						"statusSchema": 1
					}
				]
			});
			this.getView().setModel(oModel);
		}
	});

	return CardsLayoutController;

});
