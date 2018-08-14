sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.Select.Page", {

		onInit: function () {
			var oData = {
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
				]
			};

			// set explored app's demo model on this sample
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		}
	});


	return PageController;

});