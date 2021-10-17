import Log from "sap/base/Log";
import testRule from "test-resources/sap/ui/support/TestHelper";
Log.setLevel(4);
QUnit.module("sap.ui.core globalApiUsage rule tests", {
    beforeEach: function () {
        jQuery.sap.passport;
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "globalApiUsage",
    expectedNumberOfIssues: 1
});