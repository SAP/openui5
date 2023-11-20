sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"booleanParameter": {
						"manifestpath": "/sap.card1/configuration/parameters/booleanParameter/value",
						"description": "Description",
						"type": "boolean"
					}
				}
			}
		});
	};
});
