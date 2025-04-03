sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objectWithPropertiesDefined": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined/value",
						"type": "object",
						"label": "Object properties defined",
						"properties": {
							"key": {
								"label": "Key"
							},
							"icon1": {
								"label": "Icon1",
								"type": "icon"
							},
							"icon2": {
								"label": "Icon2",
								"type": "icon",
								"required": true
							},
							"icon3": {
								"label": "Icon3",
								"type": "icon",
								"allowFile": false
							}
						}
					}
				}
			}
		});
	};
});
