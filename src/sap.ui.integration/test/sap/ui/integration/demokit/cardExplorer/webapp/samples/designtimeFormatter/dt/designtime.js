sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"date": {
						"manifestpath": "/sap.card/configuration/parameters/date/value",
						"type": "date",
						"formatter": { "format": "yMMMd" }
					},
					"datetime": {
						"manifestpath": "/sap.card/configuration/parameters/datetime/value",
						"type": "datetime",
						"formatter": { "style": "long" }
					},
					"float": {
						"manifestpath": "/sap.card/configuration/parameters/float/value",
						"type": "number",
						"formatter": { "decimals": 3, "preserveDecimals": false }
					},
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"formatter": { "minIntegerDigits": 3,  "maxIntegerDigits": 6, "emptyString": ""}
					},
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
						"label": "String Array",
						"defaultValue": ["key1", "key2"],
						"type": "string[]",
						"editable": true,
						"values": {
							"data": {
								"json": [
									{ "text": "abc", "key": "key1", "additionalText": 1293883200000, "icon": "sap-icon://accept" },
									{ "text": "fsf", "key": "key2", "additionalText": 1293883200000, "icon": "sap-icon://cart" },
									{ "text": "dsf", "key": "key3", "additionalText": 1293883200000, "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "date: {= format.date(${additionalText}, {style: 'long'}) }",
								"icon": "{icon}"
							}
						}
					},
					"stringArrayReturned": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayReturned/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Invoices",
									"parameters": {
										"$select": "ShipName, ShippedDate",
										"$skip": "5",
										"$top": "5"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{ShipName}",
								"key": "{ShipName}",
								"additionalText": "{= format.dateTime(${ShippedDate}, {format: 'yMMMd'}) }"
							}
						}
					},
					"Invoices": {
						"manifestpath": "/sap.card/configuration/parameters/Invoices/value",
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
								"additionalText": "Shipped Date: {= format.date(${ShippedDate}, {pattern: 'MM-dd-yyyy'}) }"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "AbstractLive"
			}
		});
	};
});
