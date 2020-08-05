sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.sapFCard", {

		onInit: function () {
			this._createListModel();
			this._createTableModel();
			this._createAnalyticalModel();
		},

		_createAnalyticalModel: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/revenue.json"));
			this.getView().setModel(oModel, "analyticalData");
		},

		_createTableModel: function () {
			var oModel = new JSONModel({
				Names: [
					{ firstName: "Peter", lastName: "Mueller" },
					{ firstName: "Petra", lastName: "Maier" },
					{ firstName: "Thomas", lastName: "Smith" },
					{ firstName: "John", lastName: "Williams" },
					{ firstName: "Maria", lastName: "Jones" }
				]
			});

			this.getView().setModel(oModel, "tableData");
		},

		_createListModel: function () {
			var oModel = new JSONModel({
				ProductCollection: [
					{
						"ProductId": "1239106",
						"Name": "Power Projector 4713",
						"Category": "Projector",
						"SupplierName": "Titanium"
					},
					{
						"ProductId": "1239107",
						"Name": "Power Projector 4713",
						"Category": "Projector",
						"SupplierName": "Titanium"
					},
					{
						"ProductId": "1239108",
						"Name": "Power Projector 4713",
						"Category": "Projector",
						"SupplierName": "Titanium"
					},
					{
						"ProductId": "1239109",
						"Name": "Power Projector 4713",
						"Category": "Projector",
						"SupplierName": "Titanium"
					}
				]
			});

			this.getView().setModel(oModel, "listItems");
		}

	});
});