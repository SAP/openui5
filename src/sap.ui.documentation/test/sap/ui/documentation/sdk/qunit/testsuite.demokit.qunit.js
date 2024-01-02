sap.ui.define(function () {

	"use strict";
	return {
		name: "Demo Kit in sap.ui.documentation",
		defaults: {
			qunit: {
				version: 2
			}
		},

		tests: {
			// "OpaTestsComponent": {
			// 	group: "Demo Kit Opa Tests",
			// 	page: "test-resources/sap/ui/documentation/sdk/integration/opaTestsWithComponent.qunit.html"
			// },

			// Skipped because of failing infra voter caused by Ie41fc471cb048348c7b44ff6daee067cc655b8d8
			// Also see comments in change Ie39e5bf436b23af3271509b1e41de993d4287089
			// "OpaTestsIframe": {
			// 	group: "Demo Kit Opa Tests",
			// 	page: "test-resources/sap/ui/documentation/sdk/integration/opaTestsWithIFrame.qunit.html"
			// }
		}
	};
});
