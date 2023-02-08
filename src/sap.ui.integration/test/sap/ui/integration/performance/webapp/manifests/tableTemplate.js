sap.ui.define([], function () {
	"use strict";

	return {
		"_version": "1.15.0",
		"sap.app": {
			"id": "",
			"type": "card",
			"title": "Sample of a Table Card",
			"subTitle": "Sample of a Table Card",
			"applicationVersion": {
				"version": "1.0.0"
			},
			"shortTitle": "A short title for this Card",
			"info": "Additional information about this Card",
			"description": "A long description for this Card",
			"tags": {
				"keywords": [
					"Table",
					"Card",
					"Sample"
				]
			}
		},
		"sap.ui": {
			"technology": "UI5",
			"icons": {
				"icon": "sap-icon://table-view"
			}
		},
		"sap.card": {
			"type": "Table",
			"data": {
				"json": [{
						"salesOrder": "5000010050",
						"customerName": "Robert Brown Entertainment",
						"netAmount": "2K USD",
						"status": "Delivered",
						"statusState": "Success",
						"deliveryProgress": 100
					},
					{
						"salesOrder": "5000010051",
						"customerName": "Entertainment Argentinia",
						"netAmount": "127k USD",
						"status": "Canceled",
						"statusState": "Error",
						"deliveryProgress": 0
					},
					{
						"salesOrder": "5000010052",
						"customerName": "Brazil Technologies",
						"netAmount": "8K USD",
						"status": "In Progress",
						"statusState": "Warning",
						"deliveryProgress": 33
					},
					{
						"salesOrder": "5000010053",
						"customerName": "Quimica Madrilenos",
						"netAmount": "25K USD",
						"status": "Delivered",
						"statusState": "Success",
						"deliveryProgress": 100
					}
				]
			},
			"header": {
				"title": "Sales Orders for Key Accounts",
				"subTitle": "Today"
			},
			"content": {
				"maxItems": 4,
				"row": {
					"columns": [{
							"title": "Sales Order",
							"value": "{salesOrder}",
							"identifier": true
						},
						{
							"title": "Customer",
							"value": "{customerName}"
						},
						{
							"title": "Net Amount",
							"value": "{netAmount}",
							"hAlign": "End"
						},
						{
							"title": "Status",
							"value": "{status}",
							"state": "{statusState}"
						},
						{
							"title": "Delivery Progress",
							"progressIndicator": {
								"percent": "{deliveryProgress}",
								"text": "{= format.percent(${deliveryProgress} / 100)}",
								"state": "{statusState}"
							}
						}
					]
				}
			}
		}
	};
});