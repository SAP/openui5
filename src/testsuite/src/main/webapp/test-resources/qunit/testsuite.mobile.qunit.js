sap.ui.define([], function() {
	"use strict";

	return {
		name: "Global Mobile QUnit TestSuite (OpenUI5 scope)",
		defaults: {
			page: "test-resources/{name}/qunit/testsuite.mobile.qunit.html"
		},
		tests: {
			"sap/m": {},
			"sap/f": {
				page: "test-resources/{name}/qunit/testsuite.qunit.html"
			},
			"sap/tnt": {},
			"sap/ui/core": {
				page: "test-resources/{name}/qunit/testsuite.qunit.html"
			},
			"sap/ui/layout": {
				page: "test-resources/{name}/qunit/testsuite.qunit.html"
			},
			"sap/ui/unified": {
				page: "test-resources/{name}/qunit/testsuite.qunit.html"
			}
		}
	};
});
