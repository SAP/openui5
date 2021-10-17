import Log from "sap/base/Log";
import Fragment from "sap/ui/core/Fragment";
import Component from "sap/ui/core/Component";
import Controller from "sap/ui/core/mvc/Controller";
import ExtensionPoint from "sap/ui/core/ExtensionPoint";
import testRule from "test-resources/sap/ui/support/TestHelper";
Log.setLevel(4);
var iIncrement = 0;
var fnIncrement = function (iNumber) {
    return function () {
        iIncrement += iNumber;
        return iIncrement;
    };
};
QUnit.module("sap.ui.fragment rule tests", {
    beforeEach: function () {
        sap.ui.fragment("test-resources/sap/ui/core/qunit/fragment/Fragment", "XML");
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "syncFactoryLoading",
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("sap.ui.extensionpoint rule tests", {
    beforeEach: function () {
        sap.ui.extensionpoint();
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "syncFactoryLoading",
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("sap.ui.controller rule tests", {
    beforeEach: function () {
        Controller.extend("mySyncController", function () {
        });
        sap.ui.controller("mySyncController");
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "syncFactoryLoading",
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("sap.ui.component rule tests", {
    beforeEach: function () {
        sap.ui.component("LoremIpsum");
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "syncFactoryLoading",
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("sap.ui.view rule tests", {
    beforeEach: function () {
        try {
            sap.ui.view("test");
        }
        catch (e) {
        }
        try {
            sap.ui.xmlview("test");
        }
        catch (e) {
        }
        try {
            sap.ui.htmlview("test");
        }
        catch (e) {
        }
        try {
            sap.ui.jsonview("test");
        }
        catch (e) {
        }
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "syncFactoryLoading",
    expectedNumberOfIssues: fnIncrement(4)
});
QUnit.module("sap.ui.template rule tests", {
    beforeEach: function () {
        try {
            sap.ui.template("test");
        }
        catch (e) {
        }
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "syncFactoryLoading",
    expectedNumberOfIssues: fnIncrement(1)
});