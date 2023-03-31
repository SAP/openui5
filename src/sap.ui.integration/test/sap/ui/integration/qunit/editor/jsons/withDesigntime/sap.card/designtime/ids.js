sap.ui.define(["sap/ui/integration/Designtime"
], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"label": "String Label",
						"translatable": true,
						"allowDynamicValues": true
					},
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"label": "Integer Label"
					},
					"integerVisualization": {
						"manifestpath": "/sap.card/configuration/parameters/integerVisualization/value",
						"type": "integer",
						"label": "Integer Label using Slider",
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
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"type": "boolean",
						"label": "Boolean Label"
					},
					"booleanVisualization": {
						"manifestpath": "/sap.card/configuration/parameters/booleanVisualization/value",
						"type": "boolean",
						"label": "Boolean Label using Switch",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"date": {
						"manifestpath": "/sap.card/configuration/parameters/date/value",
						"type": "date",
						"label": "Date Label"
					},
					"datetime": {
						"manifestpath": "/sap.card/configuration/parameters/datetime/value",
						"type": "datetime",
						"label": "Datetime Label"
					},
					"number": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"type": "number",
						"label": "Number Label"
					},
					"stringArrayWithNoValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayWithNoValues/value",
						"description": "String Array no value",
						"type": "string[]",
						"label": "StringArrayWithNoValues Label"
					},
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
						"description": "String Array",
						"type": "string[]",
						"label": "StringArray Label",
						"values": {
							"data": {
								"json": [
									{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
									{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
									{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
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
					"stringArrayWithRequestAndMultiInput": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayWithRequestAndMultiInput/value",
						"type": "string[]",
						"required": true,
						"label": "StringArrayWithRequestAndMultiInput Label",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						},
						"visualization": {
							"type": "MultiInput"
						}
					}
				}
			}
		});
	};
});
