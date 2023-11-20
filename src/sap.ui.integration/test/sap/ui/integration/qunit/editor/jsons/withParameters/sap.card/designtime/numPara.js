/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"floatParameter": {
						"manifestpath": "/sap.card/configuration/parameters/floatParameter/value",
						"type": "number",
						"formatter": { decimals: 3 }
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
