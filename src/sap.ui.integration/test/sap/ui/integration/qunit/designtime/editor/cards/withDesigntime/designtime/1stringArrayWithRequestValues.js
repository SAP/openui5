sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringArrayParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
						"defaultValue": ["key1"],
						"description": "String Array",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "test-resources/sap/ui/integration/qunit/designtime/editor/cards/withDesigntime/1stringWithRequestValues.json"
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
