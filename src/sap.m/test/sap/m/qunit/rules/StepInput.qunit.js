/*global QUnit */

sap.ui.define([
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/StepInput",
	"test-resources/sap/ui/support/TestHelper"
], function(Page, Panel, StepInput, testRule) {
	"use strict";

	QUnit.module("StepInput rules", {
		beforeEach: function() {
			this.page = new Page({
				content: [
					new Panel({
						id: "StepInputTestsContext1",
						content: [
							new StepInput({
								step: 0.255,
								displayValuePrecision: 2
							}),
							new StepInput({
								step: 0.2,
								displayValuePrecision: 2
							}),
							new StepInput({
								step: 0.255,
								displayValuePrecision: 3
							})
						]
					}),
					new Panel({
						id: "StepInputTestsContext2",
						content: [
							new StepInput({
								fieldWidth: '20px'
							}),
							new StepInput(),
							new StepInput({
								fieldWidth: '20px',
								description: 'descr.'
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
		executionScopeSelectors: "StepInputTestsContext1",
		libName: "sap.m",
		ruleId: "stepInputStepProperty",
		expectedNumberOfIssues: 1
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "StepInputTestsContext2",
		libName: "sap.m",
		ruleId: "stepInputFieldWidth",
		expectedNumberOfIssues: 1
	});
});
