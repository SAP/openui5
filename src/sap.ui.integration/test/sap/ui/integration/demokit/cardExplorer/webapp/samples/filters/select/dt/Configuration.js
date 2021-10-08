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
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
