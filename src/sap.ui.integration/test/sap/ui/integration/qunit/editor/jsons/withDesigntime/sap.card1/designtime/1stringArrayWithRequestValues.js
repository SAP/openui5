sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringArrayParameter": {
						"manifestpath": "/sap.card1/configuration/parameters/stringArrayParameter/value",
						"description": "String Array",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "./1stringWithRequestValues.json"
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					}
				}
			}
		});
	};
});
