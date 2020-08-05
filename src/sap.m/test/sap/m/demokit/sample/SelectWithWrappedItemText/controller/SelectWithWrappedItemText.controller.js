sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.SelectWithWrappedItemText.controller.SelectWithWrappedItemText", {

		onInit: function () {
			var oData = {
				"ProductCollection": [
					{
						"ProductId": "HT-1001",
						"Name": "Select option 1"
					},
					{
						"ProductId": "HT-1002",
						"Name": "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
					},
					{
						"ProductId": "HT-1003",
						"Name": "Select option 3"
					},
					{
						"ProductId": "HT-1007",
						"Name": "Select option 4"
					},
					{
						"ProductId": "HT-1010",
						"Name": "Select option 5"
					}
				],
				"ProductCollection2": [
					{
						"ProductId": "key1",
						"Name": "Select option 1"
					},
					{
						"ProductId": "key2",
						"Name": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."
					},
					{
						"ProductId": "key3",
						"Name": "Select option 3"
					},
					{
						"ProductId": "key4",
						"Name": "Select option 4"
					},
					{
						"ProductId": "key5",
						"Name": "Select option 5"
					}
				]
			};

			// set explored app's demo model on this sample
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		}
	});
});