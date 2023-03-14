sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"title": {
						"label": "Title",
						"manifestpath": "/sap.card/header/title"
					},
					"city": {
						"type": "string",
						"label": "City",
						"description": "A name of a city, which will be displayed in the card.",
						"manifestpath": "/sap.card/configuration/parameters/city/value"
					}
				}
			},
			"preview": {
				"modes": "MockDataAbstract",
				"interactive": true
			}
		});
	};
});
