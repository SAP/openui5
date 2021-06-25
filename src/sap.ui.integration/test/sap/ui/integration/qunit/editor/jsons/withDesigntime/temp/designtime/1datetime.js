sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"datetimeParameter": {
						"manifestpath": "/temp/configuration/parameters/datetimeParameter/value",
						"type": "datetime"
					}
				}
			}
		});
	};
});
