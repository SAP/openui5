sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"object": {
						"manifestpath": "/sap.card/configuration/parameters/object/value",
						"type": "object",
						"label": "Object Field"
					}
				}
			}
		});
	};
});
