sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement",
	"sap/m/VBox",
	"sap/m/Title",
	"sap/ui/integration/widgets/Card"
], function (Controller, JSONModel, Measurement, VBox, Title, Card) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.CardMeasurements", {

		onInit: function () {
			this.getView().setModel(new JSONModel({
				cards: [
					{
						cardId: "listCard",
						manifest: "cardsdemo/bundles/listbundle/manifest.json"
					},
					{
						cardId: "cardWithExtension",
						manifest: "cardsdemo/bundles/cardWithExtension/manifest.json"
					},
					{
						cardId: "analyticalCard",
						manifest: "cardsdemo/bundles/analyticalLineSingleData/manifest.json"
					}
				],
				snippets: [
					{
						title: "UI5 Integration Card Measurements for Specific Card",
						code: 'sap.ui.requireSync(["sap/ui/performance/Measurement"]).filterMeasurements(function (measurement) {\n' +
							'\treturn measurement.id.includes("yourCardId") && measurement.id.includes("UI5 Integration Cards");\n' +
						'});'
					},
					{
						title: "All Measurements for Specific Card",
						code: 'sap.ui.requireSync(["sap/ui/performance/Measurement"]).filterMeasurements(function (measurement) {\n' +
							'\treturn measurement.id.includes("yourCardId");\n' +
						'});'
					}
				]
			}), "cardMeasurements");
		},

		getMeasurements: function (cardId) {
			return Measurement.filterMeasurements(function (measurement) {
				return measurement.id.includes(cardId) && measurement.id.includes("UI5 Integration Cards");
			});
		},

		measurementDetailsFactory: function () {
			return this.byId("measurementDetails").clone();
		},

		showMeasurements: function () {
			this.getView().findAggregatedObjects(true, function (e) {
				return e.isA("sap.ui.integration.widgets.Card");
			})
			.forEach(function (card) {
				var measurements = this.getMeasurements(card.getId());
				var bindingPath = card.getBindingContext("cardMeasurements").getPath();

				measurements.sort(this.sortWithFirstRenderingWithDynamicDataLast);
				measurements.forEach(this.shortenMeasurementId.bind(null, card.getId()));

				this.getView().getModel("cardMeasurements").setProperty(bindingPath + "/measurements", measurements);
			}.bind(this));
		},

		sortWithFirstRenderingWithDynamicDataLast: function (measurement1, measurement2) {
			if (measurement1.id.includes("firstRenderingWithDynamicData")) {
				return 1;
			} else if (measurement2.id.includes("firstRenderingWithDynamicData")) {
				return -1;
			}

			return 0;
		},

		shortenMeasurementId: function (cardId, measurement) {
			measurement.id = measurement.id.substring(measurement.id.indexOf(cardId) + cardId.length + 3 /* 3 for the --- symbols */);
		},

		cardFactory: function (idPrefix, bindingContext) {
			var container = new VBox();

			container.addItem(new Title({
				text: "Measurements for \"" + bindingContext.getProperty("cardId") + "\"",
				titleStyle: "H3"
			}));
			container.addItem(new VBox({
				items: {
					path: "cardMeasurements>measurements",
					factory: this.measurementDetailsFactory.bind(this)
				}
			}));
			container.addItem(new Card(bindingContext.getProperty("cardId"), {
				manifest: bindingContext.getProperty("manifest")
			}));

			return container;
		}

	});
});