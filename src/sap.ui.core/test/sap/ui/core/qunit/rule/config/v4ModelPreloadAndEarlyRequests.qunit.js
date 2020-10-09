/*global QUnit*/

sap.ui.define([
	"sap/ui/core/Component",
	"test-resources/sap/ui/support/TestHelper"
], function(
	Component,
	testRule
) {
	"use strict";
	var oCreatedComponent;

	QUnit.module("sap.ui.core v4ModelPreloadAndEarlyRequests rule tests", {
		afterEach: function() {
			oCreatedComponent.destroy();
		}
	});

	return Component.create({
		name: "samples.components.config.v4ModelPreloadAndEarlyRequests"
	}).then(function(oComponent) {
		oCreatedComponent = oComponent;

		function checkIssues(assert, oIssues) {
			oIssues.forEach(function(oIssue, i) {
				var sDetail = "Set sap.ui5.models['" + (i ? "without earlyRequests" : "")
						+ "'].settings.earlyRequests in manifest to true";

				assert.strictEqual(oIssue.details, sDetail);
				assert.strictEqual(oIssue.rule.id, "v4ModelPreloadAndEarlyRequests");
				assert.strictEqual(oIssue.rule.title,
					"OData V4 model preloading and no earlyRequests");
				assert.strictEqual(oIssue.severity, "High");
			});
		}

		testRule({
			executionScopeType: "global",
			libName: "sap.ui.core",
			ruleId: "v4ModelPreloadAndEarlyRequests",
			expectedNumberOfIssues: 2,
			checkIssues: checkIssues
		});
	});
});