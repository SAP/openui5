sap.ui.define([], function() {
	"use strict";

	return {
		name: "TestSuite for Demoapp Scenarios (OpenUI5 scope)",
		defaults: {
			page: "test-resources/{name}/qunit/testsuite.demoapps.qunit.html"
		},
		tests: {
			"sap/m": {},
			"sap/tnt": {},
			"sap/ui/core": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.demoapps.qunit.html"
			},
			"sap/ui/documentation/sdk": {},
			"sap/ui/integration": {}
		}
	};
});
