sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"group": {
						"label": "Group",
						"type": "group",
						"hint": "Hint of Group"
					},
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"label": "StaticLabel",
						"hint": "Hint of parameter string"
					},
					"subGroup1": {
						"type": "group",
						"label": "Sub group 1",
						"hint": "Hint of sub group subGroup1",
						"level": "1"
					},
					"string1": {
						"type": "string",
						"required": true,
						"allowSettings": true,
						"validation": {
							"maxLength": 10
						},
						"hint": "Hint of parameter string1",
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
					},
					"subGroup2": {
						"type": "group",
						"label": "Sub group 2",
						"level": "1",
						"hint": "Hint of sub group subGroup2",
						"visualization": {
							"type": "Tab"
						}
					},
					"string3": {
						"type": "string",
						"required": true,
						"allowSettings": true,
						"validation": {
							"maxLength": 10
						},
						"manifestpath": "/sap.card/configuration/parameters/string3/value"
					},
					"string4": {
						"type": "string",
						"allowSettings": true,
						"manifestpath": "/sap.card/configuration/parameters/string4/value",
						"hint": "Hint of parameter string4",
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
