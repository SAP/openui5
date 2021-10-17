import Component from "sap/ui/core/Component";
import testRule from "test-resources/sap/ui/support/TestHelper";
import Log from "sap/base/Log";
Log.setLevel(4);
var iIncrement = 0;
var fnIncrement = function (iNumber) {
    return function () {
        iIncrement += iNumber;
        return iIncrement;
    };
};
QUnit.module("Async ControllerExtension", {
    beforeEach: function (assert) {
        return new Promise(function (resolve, reject) {
            sap.ui.require(["sap/ui/core/Component"], function (Component) {
                Component.create({
                    name: "mvc.testdata.ControllerExtensionTest.Test2"
                }).then(function (oComponent) {
                    return oComponent.getRootControl().loaded();
                }).then(function (oView) {
                    resolve();
                });
            });
        });
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "controllerExtension",
    async: true,
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("Sync ControllerExtension", {
    beforeEach: function (assert) {
        sap.ui.component({
            name: "mvc.testdata.ControllerExtensionTest.SyncWrongExtension"
        });
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "controllerExtension",
    async: false,
    expectedNumberOfIssues: fnIncrement(1)
});