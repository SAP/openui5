/*global QUnit testRule*/
sap.ui.define(function() {
	"use strict";

	QUnit.module("sap.ui.core globalApiUsage rule tests", {
		beforeEach: function() {
			/* eslint-disable no-unused-expressions */
			jQuery.sap.passport;
			/* eslint-enable no-unused-expressions */
		},
		afterEach: function() {
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalApiUsage",
		expectedNumberOfIssues: 1
	});
});