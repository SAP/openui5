/*global QUnit testRule*/
sap.ui.define(["test-resources/sap/ui/support/TestHelper"], function() {
	"use strict";

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