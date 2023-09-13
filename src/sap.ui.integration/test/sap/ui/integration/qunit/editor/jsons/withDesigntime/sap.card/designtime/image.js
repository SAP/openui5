sap.ui.define([
	"sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"imageParameter": {
						"manifestpath": "/sap.card/configuration/parameters/imageParameter/value",
						"type": "string",
						"visualization": {
							"type": "ImageSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "AbstractLive",
				"src": "./img/preview.png"
			}
		});
	};
});
