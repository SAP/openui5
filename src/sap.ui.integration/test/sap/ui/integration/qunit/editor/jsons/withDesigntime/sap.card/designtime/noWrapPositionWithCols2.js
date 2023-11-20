sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"booleanParameter": {
						"manifestpath": "/sap.card1/configuration/parameters/booleanParameter/value",
						"description": "Description",
						"type": "boolean",
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					},
					"booleanParameterWithSwitch": {
						"manifestpath": "/sap.card1/configuration/parameters/booleanParameterWithSwitch/value",
						"description": "Description",
						"type": "boolean",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						},
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					},
					"dateParameter": {
						"manifestpath": "/sap.card/configuration/parameters/dateParameter/value",
						"type": "date",
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					},
					"datetimeParameter": {
						"manifestpath": "/sap.card/configuration/parameters/datetimeParameter/value",
						"type": "datetime",
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					},
					"integerParameter": {
						"manifestpath": "/sap.card/configuration/parameters/integerParameter/value",
						"type": "integer",
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					},
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
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
						},
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					},
					"numberParameter": {
						"manifestpath": "/sap.card/configuration/parameters/numberParameter/value",
						"type": "number",
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					},
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"allowDynamicValues": true,
						"layout": {
							"label-width": "50%",
							"position": "field-label"
						}
					}
				}
			}
		});
	};
});
