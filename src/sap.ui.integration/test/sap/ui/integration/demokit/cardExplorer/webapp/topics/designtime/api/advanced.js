sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
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
								"inputsAsTooltips": true
							}
						}
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"type": "boolean",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No"
							}
						}
					},
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"label": "String",
						"type": "string"
					}
				}
			},
			"preview": {
				"modes": "Abstract"
			}
		});
	};
});
