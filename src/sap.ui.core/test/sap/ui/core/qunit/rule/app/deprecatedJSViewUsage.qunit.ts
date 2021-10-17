import Log from "sap/base/Log";
import testRule from "test-resources/sap/ui/support/TestHelper";
import View from "sap/ui/core/mvc/View";
import ViewType from "sap/ui/core/mvc/ViewType";
import JSView from "sap/ui/core/mvc/JSView";
Log.setLevel(4);
QUnit.module("sap.ui.core.mvc.JSView rule tests", {
    beforeEach: function () {
        try {
            sap.ui.jsview("myJSView");
        }
        catch (e) {
        }
        try {
            View.create({ type: ViewType.JS, viewName: "myJSView" });
        }
        catch (e) {
        }
        try {
            JSView.create({ viewName: "myJSView" });
        }
        catch (e) {
        }
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "deprecatedJSViewUsage",
    expectedNumberOfIssues: 3
});