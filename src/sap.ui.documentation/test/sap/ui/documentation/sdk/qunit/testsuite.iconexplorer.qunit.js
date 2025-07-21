sap.ui.define(function () {
	"use strict";

	return {
		name: "Icon Explorer in sap.ui.documentation",
		defaults: {
			group: "Icon Explorer",
			ui5: {
				libs: "sap.ui.documentation"
			},
			qunit: {
				version: 2
			}
		},

		tests: {
			"iconexplorer/integration/opaTests": {
				title: "Integration tests for Icon Explorer",
				ui5: {
					animation: false
				}
			}
		}
	};
});
