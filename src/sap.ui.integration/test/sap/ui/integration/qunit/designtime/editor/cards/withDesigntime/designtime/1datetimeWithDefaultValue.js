sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"datetimeParameter": {
						"manifestpath": "/sap.card/configuration/parameters/datetimeParameter/value",
						"type": "datetime",
						"defaultValue": "2020-09-02T11:21:51.000Z"
					}
				}
			}
		});
	};
});
