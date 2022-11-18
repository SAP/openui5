/*global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/core/IconPool",
	"test-resources/sap/ui/support/TestHelper"
], function (Button, Page, Panel, IconPool, testRule) {
	"use strict";

	QUnit.module("Button rule tests", {
		beforeEach: function () {
			this.page = new Page({
				content: [
					new Panel({
						id: "buttonTestsContext",
						content: [
							new Button(),
							new Button({
								icon: IconPool.getIconURI("add"),
								text: "Add",
								tooltip: "Add"
							}),
							new Button({
								icon: IconPool.getIconURI("add"),
								tooltip: "Add"
							}),
							new Button({
								icon: IconPool.getIconURI("add"),
								text: "Add"
							}),
							new Button({
								icon: IconPool.getIconURI("add")
							})
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "buttonTestsContext",
		libName: "sap.m",
		ruleId: "onlyIconButtonNeedsTooltip",
		expectedNumberOfIssues: 1
	});
});
