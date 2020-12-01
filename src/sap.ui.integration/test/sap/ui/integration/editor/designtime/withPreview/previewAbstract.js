sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"defaultValue": "default value"
					}
				}
			},
			"preview": {
				"modes": "Abstract"
			}
		});
	};
});
