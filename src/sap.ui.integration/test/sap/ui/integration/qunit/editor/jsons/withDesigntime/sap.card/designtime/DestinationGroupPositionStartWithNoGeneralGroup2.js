sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"destination.group": {
						"label": "Destinations group label defined in DT",
						"type": "group",
						"expanded": false
					},
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"label": "string Parameter"
					},
					"dest1.destination": {
						"type": "destination",
						"label": "dest1 label defined in DT"
					},
					"group": {
						"label": "Group",
						"type": "group"
					},
					"booleanParameter": {
						"manifestpath": "/sap.card/configuration/parameters/booleanParameter/value",
						"description": "Description",
						"type": "boolean"
					}
				}
			}
		});
	};
});
