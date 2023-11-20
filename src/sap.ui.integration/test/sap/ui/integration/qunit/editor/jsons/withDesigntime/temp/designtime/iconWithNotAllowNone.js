sap.ui.define([
	"sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"iconParameter": {
						"manifestpath": "/temp/configuration/parameters/iconParameter/value",
						"type": "string",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowNone": false
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
