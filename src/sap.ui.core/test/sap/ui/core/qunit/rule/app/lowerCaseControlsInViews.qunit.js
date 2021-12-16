/*global QUnit */
sap.ui.define(["sap/base/Log",
	"test-resources/sap/ui/support/TestHelper",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Fragment"
], function (Log, testRule, XMLView, Fragment) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	QUnit.module("Tests for control tags in XML views that starts with lower case", {
		beforeEach: function() {
			var xml = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:ui="sap.ui">'
				+ '          <button text="Press me"/>                     '
				+ '          <ui:core.Icon src="sap-icon://search" />      ' // should not cause an issue!
				+ '    </mvc:View>                                         ';

			return Promise.allSettled([
				XMLView.create({
					viewName: 'testdata/XMLViewWithLowerCaseControl'
				}),
				Fragment.load({
					name: "testdata/XMLFragmentWithLowerCaseControl"
				}),
				XMLView.create({
					id: "xmlDefinition",
					definition: xml
				})
			]);
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "xmlViewLowerCaseControl",
		expectedNumberOfIssues: 3
	});
});