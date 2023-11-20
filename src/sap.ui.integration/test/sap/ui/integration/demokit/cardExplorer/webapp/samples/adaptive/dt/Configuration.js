sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"title": {
						"manifestpath": "/sap.card/configuration/parameters/title/value",
						"label": "Title",
						"type": "string",
						"translatable": true
					},
					"subTitle": {
						"manifestpath": "/sap.card/configuration/parameters/subTitle/value",
						"label": "SubTitle",
						"type": "string",
						"translatable": true
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});
