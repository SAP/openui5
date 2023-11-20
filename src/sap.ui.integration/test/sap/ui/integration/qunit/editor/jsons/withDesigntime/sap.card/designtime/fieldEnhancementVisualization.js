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
					"integerVisualization1": {
						"manifestpath": "/sap.card/configuration/parameters/integerVisualization1/value",
						"type": "integer",
						"label": "Integer Label using sap/m/Slider",
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
					"booleanVisualization1": {
						"manifestpath": "/sap.card/configuration/parameters/booleanVisualization1/value",
						"type": "boolean",
						"label": "Boolean Label using sap/m/Switch",
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
