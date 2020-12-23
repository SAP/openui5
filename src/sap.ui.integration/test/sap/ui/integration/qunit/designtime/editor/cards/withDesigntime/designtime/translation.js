sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"string1": {
						"manifestpath": "/sap.card/configuration/parameters/string1/value",
						"type": "string",
						"translatable": true,
						"label": "{i18n>string1label}",
						"description": "{i18n>string1desc}"
					},
					"string2": {
						"manifestpath": "/sap.card/configuration/parameters/string2/value",
						"type": "string",
						"translatable": true,
						"label": "{i18n>string2label}",
						"description": "{i18n>string2desc}"
					},
					"string3": {
						"manifestpath": "/sap.card/configuration/parameters/string3/value",
						"type": "string",
						"translatable": true,
						"label": "{i18n>string3label}",
						"description": "{i18n>string3desc}"
					},
					"string4": {
						"manifestpath": "/sap.card/configuration/parameters/string4/value",
						"type": "string",
						"translatable": true,
						"label": "{i18n>string4label}",
						"description": "{i18n>string4desc}"
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
