sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsVisualTests.controller.Custom", {
		onInit: function () {
			this._createListModel();
			this._createAnalyticalModel();
			this._createTableModel();
		},
		_createListModel: function () {
			var oData = {
				"content": {
					"data": {
						"request": {
							"url": "./cardsVisualTests/cardcontent/someitems.json"
						}
					},
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"label": "{{title_label}}",
							"value": "{Name}"
						},
						"description": {
							"label": "{{description_label}}",
							"value": "{Description}"
						}
					}
				},
				"items2": [
					{
						"title": "Test 1"
					},
					{
						"title": "Test 2"
					},
					{
						"title": "Test 3"
					}
				]
			};
			var oModel = new JSONModel();
			oModel.setData(oData);
			this.getView().setModel(oModel, "list");
		},
		_createAnalyticalModel: function () {
			var oData = {
				"content": {
					"chartType": "Line",
					"legend": {
						"visible": true,
						"position": "Right",
						"alignment": "Center"
					},
					"plotArea": {
						"dataLabel": {
							"visible": true
						}
					},
					"title": {
						"text": "Line chart",
						"visible": true,
						"alignment": "Bottom"
					},
					"measureAxis": "valueAxis",
					"dimensionAxis": "categoryAxis",
					"data": {
						"request": {
							"url": "./cardcontent/revenue.json"
						},
						"path": "/list"
					},
					"dimensions": [
						{
							"label": "Weeks",
							"value": "{Week}"
						}
					],
					"measures": [
						{
							"label": "Revenue",
							"value": "{Revenue}"
						},
						{
							"label": "Cost",
							"value": "{Cost}"
						}
					]
				}
			};
			var oModel = new JSONModel();
			oModel.setData(oData);
			this.getView().setModel(oModel, "analytical");
		},
		_createTableModel: function () {
			var oData = {
				"content": {
					"data": {
						"request": {
							"url": "./cardcontent/tableitems.json"
						},
						"path": "/names"
					},
					"columns": [
						{
							"label": "First Name",
							"value": "{firstName}"
						},
						{
							"label": "Last Name",
							"value": "{lastName}"
						}
					]
				},
				modelData: [
					{ product: "Power Projector 4713", type: "Locked" },
					{ product: "Power Projector 4713", type: "LockedBy", additionalInfo: "John Doe" },
					{ product: "Power Projector 4713", type: "LockedBy" },
					{ product: "Gladiator MX", type: "Draft" },
					{ product: "Hurricane GX", type: "Unsaved" },
					{ product: "Hurricane GX", type: "UnsavedBy", additionalInfo: "John Doe" },
					{ product: "Hurricane GX", type: "UnsavedBy"},
					{ product: "Hurricane GX", type: "Unsaved" },
					{ product: "Webcam", type: "Favorite" },
					{ product: "Deskjet Super Highspeed", type: "Flagged" }
				]
			};
			var oModel = new JSONModel();
			oModel.setData(oData);
			this.getView().setModel(oModel, "table");
		}
    });
});