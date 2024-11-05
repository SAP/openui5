sap.ui.define([], function() {
	"use strict";

	return {
		name: "Global Desktop QUnit TestSuite (OpenUI5 scope)",
		defaults: {
			page: "test-resources/{name}/qunit/testsuite.qunit.html"
		},
		tests: {
			"sap/ui/codeeditor": {},
			"sap/ui/core": {},
			"sap/ui/documentation/sdk": {},
			"sap/ui/dt": {},
			"sap/ui/fl": {},
			"sap/ui/mdc": {},
			"sap/ui/integration": {},
			"sap/ui/layout": {},
			"sap/ui/rta": {},
			"sap/ui/suite": {},
			"sap/ui/support": {},
			"sap/ui/table": {},
			"sap/ui/testrecorder": {},
			"sap/ui/unified": {},
			"sap/uxap": {}
		}
	};
});
