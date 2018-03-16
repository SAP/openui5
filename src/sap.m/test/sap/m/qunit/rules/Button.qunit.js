/*global QUnit testRule*/

sap.ui.define(["jquery.sap.global"], function (jQuery) {
	"use strict";

	QUnit.module("Button rule tests", {
		setup: function () {
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "buttonTestsContext",
						content: [
							new sap.m.Button(),
							new sap.m.Button({
								icon: sap.ui.core.IconPool.getIconURI("add"),
								text: "Add",
								tooltip: "Add"
							}),
							new sap.m.Button({
								icon: sap.ui.core.IconPool.getIconURI("add"),
								tooltip: "Add"
							}),
							new sap.m.Button({
								icon: sap.ui.core.IconPool.getIconURI("add"),
								text: "Add"
							}),
							new sap.m.Button({
								icon: sap.ui.core.IconPool.getIconURI("add")
							})
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		teardown: function () {
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
