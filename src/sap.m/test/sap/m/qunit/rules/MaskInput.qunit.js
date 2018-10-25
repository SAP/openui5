/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function(jQuery, testRule) {
	"use strict";

	QUnit.module("MaskInput rules", {
		setup: function() {
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "MaskInputTestsContext1",
						content: [
							new sap.m.MaskInput({
								mask: ""
							})
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		teardown: function() {
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
