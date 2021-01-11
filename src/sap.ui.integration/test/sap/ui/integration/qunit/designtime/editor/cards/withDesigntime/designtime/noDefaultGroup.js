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
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"defaultValue": "stringParameterDefaultValue",
						"allowDynamicValues": true
					}
				}
			}
		});
	};
});
