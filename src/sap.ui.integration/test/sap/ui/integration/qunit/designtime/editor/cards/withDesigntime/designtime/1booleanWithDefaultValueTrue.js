sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"booleanParameter": {
						"manifestpath": "/sap.card/configuration/parameters/booleanParameter/value",
						"type": "boolean",
						"defaultValue": true
					}
				}
			}
		});
	};
});
