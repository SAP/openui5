sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"myParameter1": {
						"manifestpath": "/sap.card/configuration/parameters/myParameter1/value",
						"type": "string",
						"defaultValue": "myParameter1DefaultValue"
					},
					"myParameter2": {
						"manifestpath": "/sap.card/configuration/parameters/myParameter2/value",
						"type": "int",
						"defaultValue": 6
					}
				}
			}
		});
	};
});
