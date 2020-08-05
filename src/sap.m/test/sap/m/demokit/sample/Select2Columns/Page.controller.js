sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.Select2Columns.Page", {

		onInit: function () {
			var oData = {
				"ProductCollection": [
					{
						"ProductId": "HT-1000",
						"Name": "Notebook Basic 15",
						"CurrencyCode": "EUR",
						"Price": 956
					},
					{
						"ProductId": "HT-1001",
						"Name": "Notebook Basic 17",
						"CurrencyCode": "EUR",
						"Price": 1249
					},
					{
						"ProductId": "HT-1002",
						"Name": "Notebook Basic 18",
						"CurrencyCode": "EUR",
						"Price": 1570
					},
					{
						"ProductId": "HT-1003",
						"Name": "Notebook Basic 19",
						"CurrencyCode": "EUR",
						"Price": 1650
					},
					{
						"ProductId": "HT-1007",
						"Name": "ITelO Vault",
						"CurrencyCode": "EUR",
						"Price": 299
					},
					{
						"ProductId": "HT-1010",
						"Name": "Notebook Professional 15",
						"CurrencyCode": "EUR",
						"Price": 1999
					},
					{
						"ProductId": "HT-1011",
						"Name": "Notebook Professional 17",
						"CurrencyCode": "EUR",
						"Price": 2299
					},
					{
						"ProductId": "HT-1020",
						"Name": "ITelO Vault Net",
						"CurrencyCode": "EUR",
						"Price": 459
					},
					{
						"ProductId": "HT-1021",
						"Name": "ITelO Vault SAT",
						"CurrencyCode": "EUR",
						"Price": 149
					},
					{
						"ProductId": "HT-1022",
						"Name": "Comfort Easy",
						"CurrencyCode": "EUR",
						"Price": 1679
					},
					{
						"ProductId": "HT-1023",
						"Name": "Comfort Senior",
						"CurrencyCode": "EUR",
						"Price": 512
					}
				]
			};

			// set explored app's demo model on this sample
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		}
	});

	return PageController;
});