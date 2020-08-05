/*global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/RuleAnalyzer"
], function(Button, JSONModel, RuleAnalyzer) {
	"use strict";

	QUnit.module("sap.ui.core.rules.Model.support", {

		beforeEach: function() {
			// create a Model
			var oModel = new JSONModel({
				actionName: "Say Hello"
			});

			// wrong path: 'actoinName' instead of 'actionName'
			var button = new Button({
				text:'{/actoinName}'
			});
			button.setModel(oModel);
			button.placeAt("qunit-fixture");
		}
	});

	QUnit.test("bindingPathSyntaxValidation", function(assert) {
		var sRuleId = "bindingPathSyntaxValidation";

		return RuleAnalyzer.analyze({type: "global"}, [{libName: "sap.ui.core", ruleId: sRuleId}])
			.then(function() {
				var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

				assert.strictEqual(aIssues.length, 1, "Expected issues ");
				assert.strictEqual(aIssues[0].rule.id, sRuleId);
			});
	});
});