sap.ui.define([
	"jquery.sap.global",
	"./Formatter",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(jQuery, Formatter, Controller, JSONModel) {
"use strict";


	return Controller.extend("sap.tnt.sample.InfoLabelInTable.V", {
		onInit: function () {

			var oData = {
				"ProductCollection": [
					{
						"ProductId": "HT-1000",
						"SupplierName": "Very Best Screens",
						"Name": "Notebook Basic 15",
						"Status": "Available",
						"CurrencyCode": "EUR",
						"Price": 956,
						"Width": 30,
						"Depth": 18,
						"Height": 3,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1001",
						"SupplierName": "Very Best Screens",
						"Name": "Notebook Basic 17",
						"Status": "Sold out",
						"CurrencyCode": "EUR",
						"Price": 1249,
						"Width": 29,
						"Depth": 17,
						"Height": 3.1,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1002",
						"SupplierName": "Very Best Screens",
						"Name": "Notebook Basic 18",
						"Status": "Available",
						"CurrencyCode": "EUR",
						"Price": 1570,
						"Width": 28,
						"Depth": 19,
						"Height": 2.5,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1003",
						"SupplierName": "Smartcards",
						"Name": "Notebook Basic 19",
						"Status": "Available",
						"CurrencyCode": "EUR",
						"Price": 1650,
						"Width": 32,
						"Depth": 21,
						"Height": 4,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1007",
						"SupplierName": "Technocom",
						"Name": "ITelO Vault",
						"Status": "Sold out",
						"CurrencyCode": "EUR",
						"Price": 299,
						"Width": 32,
						"Depth": 22,
						"Height": 3,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1010",
						"SupplierName": "Very Best Screens",
						"Name": "Notebook Professional 15",
						"Status": "No longer available",
						"CurrencyCode": "EUR",
						"Price": 1999,
						"Width": 33,
						"Depth": 20,
						"Height": 3,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1011",
						"SupplierName": "Very Best Screens",
						"Name": "Notebook Professional 17",
						"Status": "Sold out",
						"CurrencyCode": "EUR",
						"Price": 2299,
						"Width": 33,
						"Depth": 23,
						"Height": 2,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1020",
						"SupplierName": "Technocom",
						"Name": "ITelO Vault Net",
						"Status": "delivery expected",
						"CurrencyCode": "EUR",
						"Price": 459,
						"Width": 10,
						"Depth": 1.8,
						"Height": 17,
						"DimUnit": "cm"
					},
					{
						"ProductId": "HT-1021",
						"SupplierName": "Technocom",
						"Name": "ITelO Vault SAT",
						"Status": "delivery expected",
						"CurrencyCode": "EUR",
						"Price": 149,
						"Width": 11,
						"Depth": 1.7,
						"Height": 18,
						"DimUnit": "cm"
					}
				]
			};

			// set explored app's demo model on this sample
			var oModel = new JSONModel();
			oModel.setData(oData);
			this.getView().setModel(oModel);
		},

		onPopinLayoutChanged: function() {
			var oTable = this.byId("idProductsTable");
			var oComboBox = this.byId("idPopinLayout");
			var sPopinLayout = oComboBox.getSelectedKey();
			switch (sPopinLayout) {
				case "Block":
					oTable.setPopinLayout(sap.m.PopinLayout.Block);
					break;
				case "GridLarge":
					oTable.setPopinLayout(sap.m.PopinLayout.GridLarge);
					break;
				case "GridSmall":
					oTable.setPopinLayout(sap.m.PopinLayout.GridSmall);
					break;
				default:
					oTable.setPopinLayout(sap.m.PopinLayout.Block);
					break;
			}
		}
	});
});
