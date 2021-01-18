sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringParameterWithValues": {
						"manifestpath": "/sap.card/configuration/parameters/1stringWithRequestValues/value",
						"type": "string",
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
