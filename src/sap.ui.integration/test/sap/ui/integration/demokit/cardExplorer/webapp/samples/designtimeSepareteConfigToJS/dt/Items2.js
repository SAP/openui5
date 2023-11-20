sap.ui.define([
	"sap/ui5/test/editor/listcard/separateconfigtojs/dt/Functions"
], function (
	Functions
) {
	"use strict";
	return {
		"formatterGroup": {
			"type": "group",
			"label": "Formatter",
			"expanded": false
		},
		"dateFormatter": {
			"manifestpath": "/sap.card/configuration/parameters/dateFormatter/value",
			"label": "Date Formatter",
			"type": "date",
			"formatter": {
				"style": "long"
			}
		},
		"datetimeFormatter": {
			"manifestpath": "/sap.card/configuration/parameters/datetimeFormatter/value",
			"label": "Datetime Formatter",
			"type": "datetime",
			"formatter": {
				"style": "long"
			}
		},
		"floatFormatter": {
			"manifestpath": "/sap.card/configuration/parameters/floatFormatter/value",
			"label": "Float Formatter",
			"type": "number",
			"formatter": {
				"decimals": 3,
				"style":"short"
			}
		},
		"integerFormatter": {
			"manifestpath": "/sap.card/configuration/parameters/integerFormatter/value",
			"label": "Integer Formatter",
			"type": "integer",
			"formatter": {
				"minIntegerDigits": 3,
				"maxIntegerDigits": 6,
				"emptyString": ""
			}
		},
		"percentFormatter": {
			"manifestpath": "/sap.card/configuration/parameters/percentFormatter/value",
			"label": "String Array",
			"type": "string[]",
			"editable": true,
			"values": {
				"data": {
					"json": [
						{ "text": 0.3, "key": "key1", "additionalText": 1293883200000, "icon": "sap-icon://accept" },
						{ "text": 0.6, "key": "key2", "additionalText": 1293883200000, "icon": "sap-icon://cart" },
						{ "text": 0.8, "key": "key3", "additionalText": 1293883200000, "icon": "sap-icon://zoom-in" }
					],
					"path": "/"
				},
				"item": {
					"text": "Percent: {= format.percent(${text}) }",
					"key": "{key}",
					"additionalText": "datetime: {= format.dateTime(${additionalText}, {style: 'long'}) }",
					"icon": "{icon}"
				}
			}
		},
		"formatterinText": {
			"manifestpath": "/sap.card/configuration/parameters/formatterinText/value",
			"label": "Return String Array Values",
			"type": "string",
			"values": {
				"data": {
					"request": {
						"url": "{{destinations.northwind}}/Invoices",
						"parameters": {
							"$select": "ShipName, ShippedDate",
							"$skip": "8",
							"$top": "8"
						}
					},
					"path": "/value"
				},
				"item": {
					"text": "{ShipName}",
					"key": "{ShipName}",
					"additionalText": "Shipped Date: {= format.dateTime(${ShippedDate}, {style: 'short'}) }"
				}
			}
		}
	};
});