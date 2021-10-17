import Button from "sap/m/Button";
import JSONModel from "sap/ui/model/json/JSONModel";
import RuleAnalyzer from "sap/ui/support/RuleAnalyzer";
QUnit.module("sap.ui.core.rules.Model.support", {
    beforeEach: function () {
        var oModel = new JSONModel({
            actionName: "Say Hello"
        });
        var button = new Button({
            text: "{/actoinName}"
        });
        button.setModel(oModel);
        button.placeAt("qunit-fixture");
    }
});
QUnit.test("bindingPathSyntaxValidation", function (assert) {
    var sRuleId = "bindingPathSyntaxValidation";
    return RuleAnalyzer.analyze({ type: "global" }, [{ libName: "sap.ui.core", ruleId: sRuleId }]).then(function () {
        var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;
        assert.strictEqual(aIssues.length, 1, "Expected issues ");
        assert.strictEqual(aIssues[0].rule.id, sRuleId);
    });
});