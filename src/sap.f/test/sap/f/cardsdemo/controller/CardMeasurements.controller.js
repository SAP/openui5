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
						title: "Markers for Specific Card",
						code: 'performance.getEntriesByType("mark").filter(function (mark) {\n' +
							'\treturn mark.name.includes("yourCardId") && mark.name.includes("UI5 Integration Cards");\n' +
						'});'
					},
					{
						title: "Measurements for Specific Card",
						code: 'performance.getEntriesByType("measure").filter(function (measure) {\n' +
							'\treturn measure.name.includes("yourCardId") && measure.name.includes("UI5 Integration Cards");\n' +
						'});'
					}
				]
			}), "cardMeasurements");
		},

		getMeasurements: function (cardId) {
			return performance.getEntriesByType("measure").filter(function (measure) {
				return measure.name.includes(cardId) && measure.name.includes("UI5 Integration Cards");
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

				this.getView().getModel("cardMeasurements").setProperty(bindingPath + "/measurements", measurements);
			}.bind(this));
		},

		sortWithFirstRenderingWithDynamicDataLast: function (measurement1, measurement2) {
			if (measurement1.name.includes("firstRenderingWithDynamicData")) {
				return 1;
			} else if (measurement2.name.includes("firstRenderingWithDynamicData")) {
				return -1;
			}

			return 0;
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