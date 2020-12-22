sap.ui.define(["sap/ui/integration/Designtime"
], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"booleanVisualization": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"defaultValue": true,
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
					},
					"dependentfield1": {
						"manifestpath": "/sap.card/configuration/parameters/dependent1/value",
						"defaultValue": "Editable changes from boolean",
						"type": "string",
						"editable": "{items>booleanVisualization/value}"
					},
					"dependentfield2": {
						"manifestpath": "/sap.card/configuration/parameters/dependent2/value",
						"defaultValue": "Visible changes from boolean",
						"type": "string",
						"visible": "{items>booleanVisualization/value}"
					},
					"dependentfield3": {
						"manifestpath": "/sap.card/configuration/parameters/dependent3/value",
						"label": "{= ${items>booleanVisualization/value}? 'dependentfield3 True' : 'dependentfield3 False' }",
						"type": "string"
					}
				}
			}
		});
	};
});
