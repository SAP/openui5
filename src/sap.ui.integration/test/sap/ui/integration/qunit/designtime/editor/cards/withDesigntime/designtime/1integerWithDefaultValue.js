sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"integerParameter": {
						"manifestpath": "/sap.card/configuration/parameters/integerParameter/value",
						"type": "integer",
						"defaultValue": 1
					}
				}
			}
		});
	};
});
