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
					"dependentfield1": {
						"manifestpath": "/sap.card/configuration/parameters/dependent1/value",
						"defaultValue": "Editable changes from boolean",
						"type": "string",
						"editable": "{= ${items>integer/value} > 2}"
					},
					"dependentfield2": {
						"manifestpath": "/sap.card/configuration/parameters/dependent2/value",
						"defaultValue": "Visible changes from boolean",
						"type": "string",
						"visible": "{= ${items>integer/value} > 5}"
					},
					"dependentfield3": {
						"manifestpath": "/sap.card/configuration/parameters/dependent3/value",
						"label": "{= ${items>integer/value} > 8 ? 'dependentfield3 True' : 'dependentfield3 False' }",
						"type": "string"
					}
				}
			}
		});
	};
});