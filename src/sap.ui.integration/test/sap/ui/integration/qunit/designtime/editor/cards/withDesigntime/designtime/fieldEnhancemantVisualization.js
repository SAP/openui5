sap.ui.define(["sap/ui/integration/Designtime"
], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"defaultValue": 1,
						"type": "integer",
						"label": "Integer Label"
					},
					"integerVisualization": {
						"manifestpath": "/sap.card/configuration/parameters/integerVisualization/value",
						"defaultValue": 2,
						"type": "integer",
						"label": "Integer Label using Slider",
						"visualization": {
							"type": "sap/m/Slider",
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
						"defaultValue": true,
						"type": "boolean",
						"label": "Boolean Label"
					},
					"booleanVisualization": {
						"manifestpath": "/sap.card/configuration/parameters/booleanVisualization/value",
						"defaultValue": false,
						"type": "boolean",
						"label": "Boolean Label using Switch",
						"visualization": {
							"type": "sap/m/Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					}
				}
			}
		});
	};
});
