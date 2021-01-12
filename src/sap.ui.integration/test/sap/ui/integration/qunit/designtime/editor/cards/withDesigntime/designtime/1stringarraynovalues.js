sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringArrayParameterNoValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayParameterNoValues/value",
						"defaultValue": ["key1"],
						"description": "String Array",
						"type": "string[]"
					},
					"stringArrayParameterNoValuesNotEditable": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayParameterNoValuesNotEditable/value",
						"defaultValue": ["key1"],
						"description": "String Array",
						"type": "string[]",
						"editable": false
					}
				}
			}
		});
	};
});
