sap.ui.define([
	"sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"iconParameter": {
						"manifestpath": "/sap.card/header/icon/src",
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
				"modes": "LiveAbstract",
				"src": "./img/preview.png"
			}
		});
	};
});
