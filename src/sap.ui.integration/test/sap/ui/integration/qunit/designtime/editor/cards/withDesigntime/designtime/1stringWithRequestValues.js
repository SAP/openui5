sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			form: {
				items: {
					stringParameterWithValues: {
						"manifestpath": "/sap.card/configuration/parameters/1stringWithRequestValues/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "test-resources/sap/ui/integration/qunit/designtime/editor/cards/withDesigntime/1stringWithRequestValues.json"
								},
								"path": "/"
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
