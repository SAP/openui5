/*global QUnit */
/**
 * @fileoverview
 * @deprecated
 */
sap.ui.define(["sap/base/Log",
	"test-resources/sap/ui/support/TestHelper",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/mvc/JSView"
], function (Log, testRule, View, ViewType, JSView) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	QUnit.module("sap.ui.core.mvc.JSView rule tests", {
		beforeEach: function () {

			try {
				sap.ui.jsview("myJSView");
			} catch (e) {
				// Nothing to be done.
				// We provoke the triggering of a rule, but the exception itself is irrelevant.
			}

			try {
				View.create({type: ViewType.JS, viewName: "myJSView"});
			} catch (e) {
				// Nothing to be done.
			}

			try {
				JSView.create({viewName: "myJSView"});
			} catch (e) {
				// Nothing to be done.
			}
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "deprecatedJSViewUsage",
		expectedNumberOfIssues: 3
	});
});