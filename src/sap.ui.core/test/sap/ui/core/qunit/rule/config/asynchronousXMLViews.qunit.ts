import jQuery from "jquery.sap.global";
import Log from "sap/base/Log";
import Component from "sap/ui/core/Component";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import XMLView from "sap/ui/core/mvc/XMLView";
import VerticalLayout from "sap/ui/layout/VerticalLayout";
import Button from "sap/m/Button";
import testRule from "test-resources/sap/ui/support/TestHelper";
QUnit.module("sap.ui.core asynchronousXMLViews rule tests", {
    beforeEach: function () {
        Log.setLevel(4);
        var sViewContent = "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns:m=\"sap.m\">" + "<m:Button text=\"Button 1\" id=\"button1\" />" + "</mvc:View>";
        this.oRootControl = new VerticalLayout({
            content: [
                new XMLView({
                    id: "asyncView",
                    async: true,
                    viewContent: sViewContent
                }),
                new XMLView({
                    id: "syncView",
                    viewContent: sViewContent
                })
            ]
        });
        this.oComponent = sap.ui.getCore().createComponent({
            name: "samples.components.routing"
        });
        this.oComponent.getRouter()._oConfig._async = false;
        this.oComponentAsyncConfig = sap.ui.getCore().createComponent({
            name: "samples.components.routing"
        });
        this.oComponentWithoutRouter = new Component();
    },
    afterEach: function () {
        this.oRootControl.destroy();
        this.oComponent.destroy();
        this.oComponentAsyncConfig.destroy();
        this.oComponentWithoutRouter.destroy();
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "asynchronousXMLViews",
    expectedNumberOfIssues: 2
});