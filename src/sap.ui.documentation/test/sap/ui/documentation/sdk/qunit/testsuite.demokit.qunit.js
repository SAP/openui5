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
			"OpaTestsIframe": {
				group: "Demo Kit Opa Tests",
				page: "test-resources/sap/ui/documentation/sdk/integration/opaTestsWithIFrame.qunit.html"
			}
		}
	};
});
