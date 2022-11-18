/*global QUnit */

sap.ui.define([
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Panel",
	"test-resources/sap/ui/support/TestHelper"
], function (Input, Label, Page, Panel, testRule) {
	"use strict";

	QUnit.module("Input rule tests", {
		beforeEach: function () {
			this.page = new Page({
				content: [
					new Panel({
						id: "inputTestsContext",
						content: [
							new Input(),
							new Label({
								text: "Label",
								labelFor: "inputWithLabelFor"
							}),
							new Input("inputWithLabelFor")
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
		executionScopeSelectors: "inputTestsContext",
		libName: "sap.m",
		ruleId: "inputNeedsLabel",
		expectedNumberOfIssues: 1
	});
});
