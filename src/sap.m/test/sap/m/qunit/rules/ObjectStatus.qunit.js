/*global QUnit */

sap.ui.define([
		"sap/m/Page",
		"sap/m/ObjectStatus",
		"test-resources/sap/ui/support/TestHelper"
], function (Page, ObjectStatus, testRule)  {
		"use strict";

		QUnit.module("ObjectStatus with active: true and no icon or text", {
			beforeEach: function () {
				this.page = new Page("objectStatusContext", {
					content: new ObjectStatus({
						active: true
					})
				});
				this.page.placeAt("qunit-fixture");
			},
			afterEach: function () {
				this.page.destroy();
			}
		});

		testRule({
			executionScopeType: "subtree",
			executionScopeSelectors: "objectStatusContext",
			libName: "sap.m",
			ruleId: "objectStatusActive",
			expectedNumberOfIssues: 1
		});
	});
