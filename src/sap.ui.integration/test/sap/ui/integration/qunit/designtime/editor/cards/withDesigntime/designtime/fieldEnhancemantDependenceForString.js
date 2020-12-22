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
						"defaultValue": "editable",
						"type": "string"
					},
					"dependentfield1": {
						"manifestpath": "/sap.card/configuration/parameters/dependent1/value",
						"defaultValue": "Editable changes from boolean",
						"type": "string",
						"editable": "{= ${items>string/value} === 'editable'}"
					},
					"dependentfield2": {
						"manifestpath": "/sap.card/configuration/parameters/dependent2/value",
						"defaultValue": "Visible changes from boolean",
						"type": "string",
						"visible": "{= ${items>string/value} === 'visible'}"
					},
					"dependentfield3": {
						"manifestpath": "/sap.card/configuration/parameters/dependent3/value",
						"label": "{= ${items>string/value} === 'label'? 'dependentfield3 True' : 'dependentfield3 False' }",
						"type": "string"
					}
				}
			}
		});
	};
});
