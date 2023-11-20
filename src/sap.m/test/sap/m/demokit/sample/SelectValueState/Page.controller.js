sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
"use strict";

var PageController = Controller.extend("sap.m.sample.SelectValueState.Page", {

	onInit: function () {
		var aProducts =  [
			{
				"ProductId": "HT-998",
				"Name": "Notebook Basic 11"
			},
			{
				"ProductId": "HT-999",
				"Name": "Notebook Basic 13"
			},
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
			},
			{
				"ProductId": "HT-1008",
				"Name": "Notebook Professional 11"
			},
			{
				"ProductId": "HT-1009",
				"Name": "Notebook Professional 13"
			},
			{
				"ProductId": "HT-1010",
				"Name": "Notebook Professional 15"
			},
			{
				"ProductId": "HT-1011",
				"Name": "Notebook Professional 17"
			},
			{
				"ProductId": "HT-1012",
				"Name": "Notebook Professional 19"
			},
			{
				"ProductId": "HT-1020",
				"Name": "ITelO Vault Net"
			},
			{
				"ProductId": "HT-1021",
				"Name": "ITelO Vault SAT"
			},
			{
				"ProductId": "HT-1022",
				"Name": "Comfort Easy"
			},
			{
				"ProductId": "HT-1023",
				"Name": "Comfort Senior"
			}
		];
		var oData = {
			"ErrorProductCollection": aProducts,
			"SelectedProductErrorCollection": "HT-998",
			"WarningProductCollection": aProducts,
			"SelectedProductWarningCollection": "HT-999",
			"SuccessProductCollection": aProducts,
			"SelectedProductSuccessCollection": "HT-1000",
			"InformationProductCollection": aProducts,
			"SelectedProductInformationCollection": "HT-1007"
		};

		// set explored app's demo model on this sample
		var oModel = new JSONModel(oData);
		this.getView().setModel(oModel);
	}
});

return PageController;
});