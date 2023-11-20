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
					"minHeight": {
						"label": "Minimum content height",
						"manifestpath": "/sap.card/configuration/parameters/minHeight/value",
						"type": "string",
						"description": "Minimum height of the content"
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
