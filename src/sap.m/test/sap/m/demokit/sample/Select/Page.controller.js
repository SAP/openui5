sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.Select.Page", {

		onInit: function () {
			var oData = {
				"SelectedProduct": "HT-1001",
				"SelectedProduct2": "HT-1001",
				"SelectedProduct3": "HT-1001",
				"ProductCollection": [
					{
						"ProductId": "HT-1000",
						"Name": "Notebook Basic 15"
					},
					{
						"ProductId": "HT-1001",
						"Name": "Notebook Basic 17"
					},
					{
						"ProductId": "HT-1002",
						"Name": "Notebook Basic 18"
					},
					{
						"ProductId": "HT-1003",
						"Name": "Notebook Basic 19"
					},
					{
						"ProductId": "HT-1007",
						"Name": "ITelO Vault"
					}
				],
				"ProductCollection2": [
					{
						"ProductId": "HT-1000",
						"Name": "Notebook Basic 15"
					},
					{
						"ProductId": "HT-1001",
						"Name": "Notebook Basic 17"
					},
					{
						"ProductId": "HT-1002",
						"Name": "Notebook Basic 18"
					},
					{
						"ProductId": "HT-1003",
						"Name": "Notebook Basic 19"
					},
					{
						"ProductId": "HT-1007",
						"Name": "ITelO Vault"
					}
				],
				"ProductCollection3": [
					{
						"ProductId": "HT-1000",
						"Name": "Notebook Basic 15"
					},
					{
						"ProductId": "HT-1001",
						"Name": "Notebook Basic 17"
					},
					{
						"ProductId": "HT-1002",
						"Name": "Notebook Basic 18"
					},
					{
						"ProductId": "HT-1003",
						"Name": "Notebook Basic 19"
					},
					{
						"ProductId": "HT-1007",
						"Name": "ITelO Vault"
					}
				],
				"Editable": true,
				"Enabled": true
			};

			// set explored app's demo model on this sample
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		},
		toggleEditable: function () {
			var oModel = this.getView().getModel(),
				oData = oModel.getData();

			oData.Editable = !oData.Editable;
			oModel.setData(oData);
		},
		toggleEnabled: function () {
			var oModel = this.getView().getModel(),
				oData = oModel.getData();

			oData.Enabled = !oData.Enabled;
			oModel.setData(oData);
		}
	});
});