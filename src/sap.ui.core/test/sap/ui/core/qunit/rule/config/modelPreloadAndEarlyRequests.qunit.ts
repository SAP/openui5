import Component from "sap/ui/core/Component";
import testRule from "test-resources/sap/ui/support/TestHelper";
var oCreatedComponent;
QUnit.module("sap.ui.core modelPreloadAndEarlyRequests rule tests", {
    afterEach: function () {
        oCreatedComponent.destroy();
    }
});