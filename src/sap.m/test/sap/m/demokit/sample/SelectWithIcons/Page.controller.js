sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.SelectWithIcons.Page", {

		onInit: function () {
			var oData = {
				"SelectedProduct": "HT-1001",
				"ProductCollection": [
					{
						"ProductId": "HT-1001",
						"Name": "Notebook Basic 17",
						"Icon": "sap-icon://paper-plane"
					},
					{
						"ProductId": "HT-1002",
						"Name": "Notebook Basic 18",
						"Icon": "sap-icon://add-document"
					},
					{
						"ProductId": "HT-1003",
						"Name": "Notebook Basic 19",
						"Icon": "sap-icon://doctor"
					},
					{
						"ProductId": "HT-1007",
						"Name": "ITelO Vault",
						"Icon": "sap-icon://sys-find-next"
					},
					{
						"ProductId": "HT-1010",
						"Name": "Notebook Professional 15",
						"Icon": "sap-icon://add-product"
					},
					{
						"ProductId": "HT-1011",
						"Name": "Notebook Professional 17",
						"Icon": "sap-icon://add-product"
					},
					{
						"ProductId": "HT-1020",
						"Name": "ITelO Vault Net",
						"Icon": "sap-icon://add-product"
					},
					{
						"ProductId": "HT-1021",
						"Name": "ITelO Vault SAT",
						"Icon": "sap-icon://add-product"
					},
					{
						"ProductId": "HT-1022",
						"Name": "Comfort Easy",
						"Icon": "sap-icon://add-product"
					},
					{
						"ProductId": "HT-1023",
						"Name": "Comfort Senior",
						"Icon": "sap-icon://add-product"
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