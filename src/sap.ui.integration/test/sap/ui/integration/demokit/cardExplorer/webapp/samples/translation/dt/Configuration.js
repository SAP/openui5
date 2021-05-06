sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"groupHeader1": {
						"label": "Translatable Texts",
						"type": "group"
					},
					"title": {
						"manifestpath": "/sap.card/header/title",
						"type": "string",
						"translatable": true,
						"label": "Card Title"
					},
					"subtitle": {
						"manifestpath": "/sap.card/header/subTitle",
						"type": "string",
						"translatable": true,
						"label": "Card Subtitle"
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
