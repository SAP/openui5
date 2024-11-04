sap.ui.define([], function() {
	"use strict";

	return {
		name: "Global QUnit TestSuite (OpenUI5 scope)",
		defaults: {
			page: "test-resources/qunit/testsuite.{name}.qunit.html"
		},
		tests: {
			"desktop": {},
			"demoapps": {},
			/**
			 * Include mobile testsuites individually to avoid duplicates for sap.ui.core etc.
			 */
			"sap/m": {
				page: "test-resources/{name}/qunit/testsuite.mobile.qunit.html"
			},
			"sap/f": {
				page: "test-resources/{name}/qunit/testsuite.qunit.html"
			},
			"sap/tnt": {
				page: "test-resources/{name}/qunit/testsuite.mobile.qunit.html"
			}
		}
	};
});
