sap.ui.define(function () {

	"use strict";
	return {
		name: "Demo Apps and Tutorials in sap.ui.integration",
		defaults: {
			qunit: {
				version: 2
			}
		},

		tests: {
			"sap/ui/integration/demokit/cardEplorer/webapp/test/integration/opaTests": {
				group: "CardExplorer",
				page: "test-resources/sap/ui/integration/demokit/cardExplorer/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/ui/integration/demokit/cardEplorer/webapp/test/unit/unitTests": {
				group: "CardExplorer",
				page: "test-resources/sap/ui/integration/demokit/cardExplorer/webapp/test/unit/unitTests.qunit.html"
			}
		}
	};
});