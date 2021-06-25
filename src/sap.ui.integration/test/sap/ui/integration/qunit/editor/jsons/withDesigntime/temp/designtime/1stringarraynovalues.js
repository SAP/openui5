sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringArrayParameterNoValues": {
						"manifestpath": "/temp/configuration/parameters/stringArrayParameterNoValues/value",
						"description": "String Array",
						"type": "string[]"
					},
					"stringArrayParameterNoValuesNotEditable": {
						"manifestpath": "/temp/configuration/parameters/stringArrayParameterNoValuesNotEditable/value",
						"description": "String Array",
						"type": "string[]",
						"editable": false
					}
				}
			}
		});
	};
});
