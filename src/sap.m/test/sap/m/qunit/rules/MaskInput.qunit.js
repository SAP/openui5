/*global QUnit */

sap.ui.define([
	"sap/m/MaskInput",
	"sap/m/Page",
	"sap/m/Panel",
	"test-resources/sap/ui/support/TestHelper"
], function(MaskInput, Page, Panel, testRule) {
	"use strict";

	QUnit.module("MaskInput rules", {
		beforeEach: function() {
			this.page = new Page({
				content: [
					new Panel({
						id: "MaskInputTestsContext1",
						content: [
							new MaskInput({
								mask: ""
							})
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function() {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "MaskInputTestsContext1",
		libName: "sap.m",
		ruleId: "maskUsesValidRules",
		expectedNumberOfIssues: 1
	});
});
