/*global QUnit */
/**
 * @fileoverview
 * @deprecated
 */
sap.ui.define(["sap/base/Log", "test-resources/sap/ui/support/TestHelper"], function(Log, testRule) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	QUnit.module("sap.ui.core globalApiUsage rule tests", {
		beforeEach: function() {
			/* eslint-disable no-unused-expressions */
			jQuery.sap.passport;
			/* eslint-enable no-unused-expressions */
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalApiUsage",
		expectedNumberOfIssues: 1
	});
});