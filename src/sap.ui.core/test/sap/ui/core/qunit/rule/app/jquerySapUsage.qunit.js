/*global QUnit testRule*/
sap.ui.define(["test-resources/sap/ui/support/TestHelper"], function(TestHelper) {
	"use strict";

	QUnit.module("sap.ui.core jquerySapUsage rule tests", {
		beforeEach: function() {
			return new Promise(function(resolve) {
				sap.ui.require(["jquery.sap.trace"], function() {
					resolve();
				});
			});
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "jquerySapUsage",
		async: true,
		expectedNumberOfIssues: 1
	});
});