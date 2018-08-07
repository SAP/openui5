/*global QUnit testRule*/
sap.ui.define(function() {
	"use strict";

	QUnit.module("sap.ui.core jquerySapUsage rule tests", {
		beforeEach: function() {
			return new Promise(function(resolve) {
				sap.ui.require(["jquery.sap.trace"], function() {
					resolve();
				});
			});
		},
		afterEach: function() {
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