sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"subGroup": {
						"type": "group",
						"label": "Sub group",
						"level": "1",
						"expanded": false,
						"visualization": {
							"type": "Tab"
						}
					},
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"allowDynamicValues": true
					},
					"subGroup2": {
						"type": "group",
						"label": "Sub group 2",
						"level": "1",
						"expanded": false
					}
				}
			}
		});
	};
});
