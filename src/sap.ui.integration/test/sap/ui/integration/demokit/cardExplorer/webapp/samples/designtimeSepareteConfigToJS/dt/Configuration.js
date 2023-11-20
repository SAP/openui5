
sap.ui.define([
	"sap/ui/integration/Designtime",
	"sap/base/util/merge",
	"sap/ui5/test/editor/listcard/separateconfigtojs/dt/Items1",
	"sap/ui5/test/editor/listcard/separateconfigtojs/dt/Items2",
	"sap/ui5/test/editor/listcard/separateconfigtojs/dt/Functions"
], function (
	Designtime,
	merge,
	Items1,
	Items2,
	Functions
) {
	"use strict";
	// create designtime
	var oItems = merge(Items1, Items2);
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": oItems
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});