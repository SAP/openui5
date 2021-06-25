sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringArrayParameterNoValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayParameterNoValues/value",
						"description": "String Array",
						"type": "string[]"
					},
					"stringArrayParameterNoValuesNotEditable": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayParameterNoValuesNotEditable/value",
						"description": "String Array",
						"type": "string[]",
						"editable": false
					}
				}
			}
		});
	};
});
