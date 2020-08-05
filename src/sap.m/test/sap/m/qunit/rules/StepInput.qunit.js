/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function(jQuery, testRule) {
	"use strict";

	QUnit.module("StepInput rules", {
		setup: function() {
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "StepInputTestsContext1",
						content: [
							new sap.m.StepInput({
								step: 0.255,
								displayValuePrecision: 2
							}),
							new sap.m.StepInput({
								step: 0.2,
								displayValuePrecision: 2
							}),
							new sap.m.StepInput({
								step: 0.255,
								displayValuePrecision: 3
							})
						]
					}),
					new sap.m.Panel({
						id: "StepInputTestsContext2",
						content: [
							new sap.m.StepInput({
								fieldWidth: '20px'
							}),
							new sap.m.StepInput(),
							new sap.m.StepInput({
								fieldWidth: '20px',
								description: 'descr.'
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
