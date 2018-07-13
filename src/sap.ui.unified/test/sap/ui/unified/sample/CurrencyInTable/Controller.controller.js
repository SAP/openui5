sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.unified.sample.CurrencyInTable.Controller", {

		onInit: function () {
			var aData = [
				{
					expense: "Flight",
					transactionAmount: {
						size: 560.67,
						currency: "EUR"
					},
					exchangeRate: 1.00000,
					amount: 560.67
				},
				{
					expense: "Meals",
					transactionAmount: {
						size: 180.50,
						currency: "USD"
					},
					exchangeRate: 0.85654,
					amount: 154.72
				},
				{
					expense: "Hotel",
					transactionAmount: {
						size: 675.00,
						currency: "USD"
					},
					exchangeRate: 0.85654,
					amount: 578.57
				},
				{
					expense: "Taxi",
					transactionAmount: {
						size: 15,
						currency: "USD"
					},
					exchangeRate: 0.85654,
					amount: 12.86
				},
				{
					expense: "Daily allowance",
					transactionAmount: {
						size: 80.00,
						currency: "BGN"
					},
					exchangeRate: 0.51129,
					amount: 40.90
				}
			];

			var oModel = new JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		}
	});

});