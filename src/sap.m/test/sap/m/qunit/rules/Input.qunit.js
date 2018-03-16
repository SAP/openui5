/*global QUnit testRule*/

sap.ui.define(["jquery.sap.global"], function (jQuery) {
	"use strict";

	QUnit.module("Input rule tests", {
		setup: function () {
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "inputTestsContext",
						content: [
							new sap.m.Input(),
							new sap.m.Label({
								text: "Label",
								labelFor: "inputWithLabelFor"
							}),
							new sap.m.Input("inputWithLabelFor")
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
		executionScopeSelectors: "inputTestsContext",
		libName: "sap.m",
		ruleId: "inputNeedsLabel",
		expectedNumberOfIssues: 1
	});
});
