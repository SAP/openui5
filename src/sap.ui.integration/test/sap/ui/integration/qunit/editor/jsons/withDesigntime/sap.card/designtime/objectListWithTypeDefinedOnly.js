sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objects": {
						"manifestpath": "/sap.card/configuration/parameters/objects/value",
						"type": "object[]",
						"label": "Object List Field"
					}
				}
			}
		});
	};
});
