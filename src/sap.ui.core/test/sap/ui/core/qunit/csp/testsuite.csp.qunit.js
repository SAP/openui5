sap.ui.define(function() {
	"use strict";
	return {
		name: "TestSuite for sap.ui.core: Content Security Policy Checks",
		defaults: {
			ui5: {
				libs: "sap.m",
				language: "en",
				preload: "async",
				"xx-libraryPreloadFiles":"none"
			},
			qunit: {
				version: 2
			}
		},
		tests: {
			ContentSecurityPolicy: {
				page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/csp/testsuite.csp.qunit&test=ContentSecurityPolicy&sap-ui-xx-csp-policy=sap-target-level-2:report-only",
				title: "QUnit test: CSP Compliance of bootstrapping the Core and test preparation logic",
				runAfterLoader: "test-resources/sap/ui/core/qunit/csp/ContentSecurityPolicyErrorHandler",
				module: "./ContentSecurityPolicy.qunit"
			},
			ContentSecurityPolicy_debug: {
				page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/csp/testsuite.csp.qunit&test=ContentSecurityPolicy&sap-ui-xx-csp-policy=sap-target-level-2:report-only&sap-ui-debug=true",
				title: "QUnit test: CSP Compliance of bootstrapping the Core and test preparation logic (Debug Mode)",
				runAfterLoader: "test-resources/sap/ui/core/qunit/csp/ContentSecurityPolicyErrorHandler",
				module: "./ContentSecurityPolicy.qunit"
			}
		}
	};
});
