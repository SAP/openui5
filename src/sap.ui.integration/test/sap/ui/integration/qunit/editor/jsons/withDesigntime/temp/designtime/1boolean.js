sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"booleanParameter": {
						"manifestpath": "/temp/configuration/parameters/booleanParameter/value",
						"description": "Description",
						"type": "boolean"
					}
				}
			}
		});
	};
});
