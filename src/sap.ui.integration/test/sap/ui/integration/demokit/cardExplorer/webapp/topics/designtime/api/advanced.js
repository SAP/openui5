sap.ui.define(["sap/ui/integration/Designtime", "sap/m/Slider", "sap/m/Switch"
], function (Designtime, Slider, Switch) {
	"use strict";

	var AdvancedDesigntime = Designtime.extend("card.test.AdvancedDesigntime");
	AdvancedDesigntime.prototype.create = function () {
		return {
			form: {
				items: {
					"integer": {
						"manifestpath": "/sap.card/.../integer/value",
						"defaultValue": 1,
						"type": "integer",
						"visualization": {
							"type": Slider,
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
						"manifestpath": "/sap.card/.../boolean/value",
						"defaultValue": false,
						"type": "boolean",
						"visualization": {
							"type": Switch,
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No"
							}
						}
					}
				}
			},
			preview: {
				modes: "Abstract"
			}
		};
	};
	return AdvancedDesigntime;
});



