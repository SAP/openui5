/*global QUnit*/

sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Component",
	"test-resources/sap/ui/support/TestHelper"
], function(
	LoaderExtensions,
	Component,
	testRule
) {
	"use strict";
	var oCreatedComponent;

	function checkIssues(assert, oIssues) {
		oIssues.forEach(function(oIssue, i) {
			var sDetail = "Set sap.ui5.models['" + (i ? "without earlyRequests" : "")
					+ "'].settings.earlyRequests in manifest to true";

			assert.strictEqual(oIssue.details, sDetail);
			assert.strictEqual(oIssue.rule.id, "modelPreloadAndEarlyRequests");
			assert.strictEqual(oIssue.rule.title,
				"OData V4 model preloading and no earlyRequests");
			assert.strictEqual(oIssue.severity, "High");
		});
	}

	QUnit.module("sap.ui.core modelPreloadAndEarlyRequests rule tests", {
		before: function() {
			// Note: language is set to "en" in the testsuite configuration
			return LoaderExtensions.loadResource("sap/ui/core/cldr/en.json", {
				async: true,
				dataType: "json",
				failOnError : false
			}).then(function() {
				return Component.create({
					name: "samples.components.config.modelPreloadAndEarlyRequests"
				}).then(function(oComponent) {
					oCreatedComponent = oComponent;
				});
			});
		},
		after: function() {
			oCreatedComponent.destroy();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "modelPreloadAndEarlyRequests",
		expectedNumberOfIssues: 2,
		checkIssues: checkIssues
	});
});