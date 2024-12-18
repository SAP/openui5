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
			"sap/ui/integration/demokit/cardEplorer/webapp/test/testsuite.qunit": {
				group: "CardExplorer",
				page: "test-resources/sap/ui/integration/demokit/cardExplorer/webapp/test/testsuite.qunit.html"
			}
		}
	};
});