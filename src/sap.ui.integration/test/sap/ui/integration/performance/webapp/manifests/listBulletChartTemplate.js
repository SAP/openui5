sap.ui.define([], function () {
	"use strict";

	return {
		"sap.app": {
			"id": "",
			"type": "card",
			"title": "Sample of a List with Bullet Chart",
			"subTitle": "Sample of a List with Bullet Chart",
			"applicationVersion": {
				"version": "1.0.0"
			},
			"shortTitle": "A short title for this Card",
			"info": "Additional information about this Card",
			"description": "A long description for this Card",
			"tags": {
				"keywords": [
					"List",
					"Chart",
					"Card",
					"Sample"
				]
			}
		},
		"sap.ui": {
			"technology": "UI5",
			"icons": {
				"icon": "sap-icon://list"
			}
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Actual income from products",
				"icon": {
					"src": "sap-icon://product"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [{

							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant",
							"Highlight": "Success",
							"Expected": 300000,
							"Actual": 330000,
							"Target": 280000,
							"ChartColor": "Good"
						},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer",
							"Highlight": "Success",
							"Expected": 300000,
							"Actual": 225000,
							"Target": 210000,
							"ChartColor": "Good"
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Multitouch LCD",
							"Highlight": "Success",
							"Expected": 300000,
							"Actual": 150000,
							"Target": 149000,
							"ChartColor": "Good"
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max.",
							"Highlight": "Warning",
							"Expected": 300000,
							"Actual": 100000,
							"Target": 100000,
							"ChartColor": "Neutral"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Powerful 500 MHz processor",
							"Highlight": "Error",
							"Expected": 300000,
							"Actual": 60000,
							"Target": 75000,
							"ChartColor": "Error"
						}
					]
				},
				"maxItems": 4,
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"info": {
						"value": "{= format.currency(${Actual} - ${Target}, 'EUR', {currencyCode:false})} {= ${Actual} - ${Target} >= 0 ? 'Profit' : 'Loss' }",
						"state": "{Highlight}"
					},
					"chart": {
						"type": "Bullet",
						"minValue": 0,
						"maxValue": "{Expected}",
						"target": "{Target}",
						"value": "{Actual}",
						"scale": "€",
						"displayValue": "{= format.currency(${Actual}, 'EUR', {currencyCode:false})}",
						"color": "{ChartColor}"
					}
				}
			}
		}
	};
});