sap.ui.define([], function () {
	"use strict";

	return {
		"sap.app": {
			"id": "",
			"type": "card",
			"title": "Sample of a Card with filters"
		},
		"sap.card": {
			"extension": "./extensions/FilterExtension",
			"configuration": {
				"filters": {
					"shipper": {
						"value": "Federal Shipping",
						"type": "Select",
						"label": "Shipper",
						"items": [
							{
								"title": "Federal Shipping",
								"key": "1"
							},
							{
								"title": "Speedy Express",
								"key": "2"
							}
						]
					},
					"country": {
						"type": "Search",
						"label": "Country",
						"value": "France",
						"placeholder": "Enter a country"
					}
				}
			},
			"data": {
				"extension": {
					"method": "getData"
				}
			},
			"type": "List",
			"header": {
				"title": "Orders by shipper 'Federal Shipping'",
				"icon": {
					"src": "sap-icon://product"
				}
			},
			"content": {
				"item": {
					"title": "{ShipName}",
					"description": "{ShipAddress}",
					"info": {
						"value": "{ShipCountry}"
					}
				},
				"maxItems": "3"
			}
		}
	};

});
