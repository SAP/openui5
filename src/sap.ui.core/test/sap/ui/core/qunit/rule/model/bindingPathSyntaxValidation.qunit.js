/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/RuleAnalyzer"
], function(Log, Button, JSONModel, RuleAnalyzer) {
	/*global QUnit*/
	"use strict";

	QUnit.module("sap.ui.core.rules.Model.support - bindingPathSyntaxValidation", {
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("fatal").never();
		}
	});

	//**********************************************************************************************
	QUnit.test("bindingPathSyntaxValidation", function(assert) {
		const oButton = new Button({text: "{/actoinName}"}); // wrong path: "actoinName" instead of "actionName"
		const oModel = new JSONModel({actionName: "Say Hello"});
		oButton.setModel(oModel);
		oButton.placeAt("qunit-fixture");
		const sRuleId = "bindingPathSyntaxValidation";

		// code under test
		return RuleAnalyzer.analyze({type: "global"}, [{libName: "sap.ui.core", ruleId: sRuleId}]).then(() => {
			const aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;
			assert.strictEqual(aIssues.length, 1, "Expected issues ");
			assert.strictEqual(aIssues[0].rule.id, sRuleId);
		});
	});
});
