/*global QUnit */
/**
 * @fileoverview
 * @deprecated
 */
sap.ui.define(["sap/base/Log", "test-resources/sap/ui/support/TestHelper"], function(Log, testRule) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

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