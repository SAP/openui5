sap.ui.define(function () {
	"use strict";

	return {
		name: "Demo Apps and Tutorials in sap.ui.documentation",
		defaults: {
			group: "Demo Apps",
			ui5: {
				libs: "sap.ui.documentation"
			},
			qunit: {
				version: 2
			}
		},

		tests: {
			// demo apps cells and download
			"demoapps/integration/opaTests": {
				title: "Integration tests for Demo Kit Demo Apps",
				ui5: {
					animation: false
				}
			},
			// demo apps formatters
			"demoapps/unit/unitTests": {
				title: "Unit tests for Demo Kit Demo Apps"
			}
		}
	};
});
