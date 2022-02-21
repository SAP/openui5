sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"subGroup1": {
						"type": "group",
						"label": "Sub group 1",
						"level": "1",
						"expanded": true,
						"visualization": {
							"type": "Tab"
						}
					},
					"stringParameter1": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter1/value",
						"type": "string",
						"allowDynamicValues": true
					},
					"subGroup2": {
						"type": "group",
						"label": "Sub group 2",
						"level": "1",
						"expanded": false,
						"visualization": {
							"type": "Tab"
						}
					},
					"subGroup3": {
						"type": "group",
						"label": "Sub group 3",
						"level": "1",
						"visualization": {
							"type": "Tab"
						}
					},
					"stringParameter2": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter2/value",
						"type": "string",
						"allowDynamicValues": true
					}
				}
			}
		});
	};
});
