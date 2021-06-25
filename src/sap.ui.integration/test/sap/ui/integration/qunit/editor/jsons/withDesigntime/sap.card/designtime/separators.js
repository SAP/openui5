sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"separator1": {
						"type": "separator"
					},
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"allowDynamicValues": true,
						"translatable": true
					},
					"separator2": {
						"type": "separator",
						"line": true
					},
					"separator3": {
						"type": "separator"
					},
					"stringInCols1": {
						"manifestpath": "/sap.card/configuration/parameters/stringInCols1/value",
						"label": "stringInCols1 long long long long long long long long long long long long label",
						"description": "aa",
						"type": "string",
						"cols": 1,
						"allowSettings": false,
						"translatable": true
					}
				}
			}
		});
	};
});
