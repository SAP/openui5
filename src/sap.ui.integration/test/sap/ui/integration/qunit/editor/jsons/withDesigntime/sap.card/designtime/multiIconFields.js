sap.ui.define([
	"sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"iconParameter1": {
						"manifestpath": "/sap.card/configuration/parameters/iconParameter1/value",
						"type": "string",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						}
					},
					"iconParameter2": {
						"manifestpath": "/sap.card/configuration/parameters/iconParameter2/value",
						"type": "string",
						"visualization": {
							"type": "IconSelect",
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
