sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"group": {
						"type": "group",
						"label": "no default group"
					},
					"subGroup": {
						"type": "group",
						"label": "Sub group",
						"level": "1",
						"visualization": {
							"type": "Tab"
						}
					},
					"string1": {
						"type": "string",
						"required": true,
						"allowSettings": true,
						"validation": {
							"maxLength": 10
						},
						"manifestpath": "/sap.card/configuration/parameters/string1/value"
					},
					"string2": {
						"type": "string",
						"allowSettings": true,
						"manifestpath": "/sap.card/configuration/parameters/string2/value",
						"validation": {
							"type": "warning",
							"minLength": 3,
							"message": "warning"
						}
					}
				}
			}
		});
	};
});
