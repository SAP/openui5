/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"editableValue": {
						"manifestpath": "/sap.card/configuration/parameters/editableValue/value",
						"type": "boolean",
						"label": "Editable Value"
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"type": "boolean",
						"label": "Boolean Label",
						"editable": "{items>editableValue/value}"
					},
					"date": {
						"manifestpath": "/sap.card/configuration/parameters/date/value",
						"type": "date",
						"label": "Date Label",
						"editable": "{items>editableValue/value}"
					},
					"datetime": {
						"manifestpath": "/sap.card/configuration/parameters/datetime/value",
						"type": "datetime",
						"label": "Datetime Label",
						"editable": "{items>editableValue/value}"
					},
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"label": "Integer Label",
						"editable": "{items>editableValue/value}"
					},
					"integerVis": {
						"manifestpath": "/sap.card/configuration/parameters/integerVis/value",
						"defaultValue": 1,
						"type": "integer",
						"visualization": {
							"type": "Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 10,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{items>editableValue/value}"
							}
						}
					},
					"number": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"type": "number",
						"label": "Number Label",
						"editable": "{items>editableValue/value}"
					},
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
						"label": "String Array",
						"defaultValue": ["key1", "key2"],
						"type": "string[]",
						"editable": "{items>editableValue/value}",
						"values": {
							"data": {
								"json": [
									{ "text": "abc", "key": "key1", "additionalText": "1293883200000", "icon": "sap-icon://accept" },
									{ "text": "fsf", "key": "key2", "additionalText": "1293883200000", "icon": "sap-icon://cart" },
									{ "text": "dsf", "key": "key3", "additionalText": "1293883200000", "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringValues/value",
						"label": "String Values",
						"defaultValue": "key2",
						"type": "string",
						"editable": "{items>editableValue/value}",
						"values": {
							"data": {
								"json": [
									{ "text": "abc", "key": "key1", "additionalText": "1293883200000", "icon": "sap-icon://accept" },
									{ "text": "fsf", "key": "key2", "additionalText": "1293883200000", "icon": "sap-icon://cart" },
									{ "text": "dsf", "key": "key3", "additionalText": "1293883200000", "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
