sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement"
], function (Controller, JSONModel, Measurement) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.CardMeasurements", {

		onInit: function () {
			this.getView().setModel(new JSONModel({
				listCard: {},
				tableCard: {},
				cardWithExtension: {}
			}));
		},

		getMeasurements: function (sCardId) {
			return Measurement.filterMeasurements(function (measurement) {
				return measurement.id.includes(sCardId) && measurement.id.includes("UI5 Integration Cards");
			});
		},

		measurementDetailsFactory: function () {
			return this.byId("measurementDetails").clone();
		},

		showMeasurements: function () {
			this.getView().findAggregatedObjects(true, function (e) {
				return e.isA("sap.ui.integration.widgets.Card");
			})
			.forEach(function (oCard) {
				this.getView().getModel().setProperty("/" + this.getView().getLocalId(oCard.getId()) + "/measurements", this.getMeasurements(oCard.getId()));
			}.bind(this));
		}

	});
});