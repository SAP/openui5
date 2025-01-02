sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"allowDynamicValues": true
					},
					"stringWithTextArea": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTextArea/value",
						"type": "string",
						"label": "Use TextArea for a string field",
						"visualization": {
							"type": "TextArea",
							"settings": {
								"value": "{currentSettings>value}",
								"width": "100%",
								"editable": "{config/editable}",
								"placeholder": "{currentSettings>placeholder}",
								"rows": 7
							}
						}
					},
					"stringParameterWithValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameterWithValues/value",
						"type": "string",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
										{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
										{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
									]
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringWithRequestValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithRequestValues/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "./1stringWithRequestValues.json"
								},
								"path": "/values"
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
			}
		});
	};
});
