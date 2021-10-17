import Log from "sap/base/Log";
import jQuery from "jquery.sap.global";
import testRule from "test-resources/sap/ui/support/TestHelper";
Log.setLevel(4);
QUnit.module("sap.ui.core EventBus logs rule tests", {
    beforeEach: function () {
        this.listener = function () { };
        sap.ui.getCore().getEventBus().subscribe("myChannel", "myEvent", this.listener);
        sap.ui.getCore().getEventBus().publish("otherChannel", "myEvent", { data: 47 });
        sap.ui.getCore().getEventBus().publish("myListener", { data: 47 });
        sap.ui.getCore().getEventBus().publish("sap.ui", "__fireUpdate", { data: 47 });
        sap.ui.getCore().getEventBus().publish("myChannel", "myEvent", { data: 47 });
    },
    afterEach: function () {
        sap.ui.getCore().getEventBus().unsubscribe("myChannel", "myEvent", this.listener);
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "eventBusSilentPublish",
    expectedNumberOfIssues: 2
});