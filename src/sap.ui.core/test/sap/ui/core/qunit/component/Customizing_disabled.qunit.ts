import Component from "sap/ui/core/Component";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import qutils from "sap/ui/qunit/QUnitUtils";
var oDIV = document.createElement("div");
oDIV.id = "content";
document.body.appendChild(oDIV);
var iStandardSub2ControllerCalled = 0;
this.standardSub2ControllerCalled = function () {
    iStandardSub2ControllerCalled++;
};
var iCustomSub2ControllerCalled = 0;
this.customSub2ControllerCalled = function () {
    iCustomSub2ControllerCalled++;
};
var aLifeCycleCalls = this.aLifeCycleCalls = [];
var oLifecycleSpy = this.oLifecycleSpy = sinon.spy();
var oComp, oCompCont;
QUnit.module("", {
    before: function () {
        return Component.create({
            name: "testdata.customizing.customer",
            id: "theComponent",
            manifest: false
        }).then(function (_oComp) {
            oComp = _oComp;
            oCompCont = new ComponentContainer({
                component: oComp
            });
            oCompCont.placeAt("content");
            return oComp.getRootControl().loaded();
        }).then(function () {
            sap.ui.getCore().applyChanges();
        });
    },
    after: function () {
        oCompCont.destroy();
        oComp.destroy();
    }
});
QUnit.test("View Replacement", function (assert) {
    assert.ok(!document.getElementById("theComponent---mainView--sub1View--customTextInCustomSub1"), "Replacement View should not be rendered");
    assert.ok(document.getElementById("theComponent---mainView--sub1View--originalSapTextInSub1"), "Original View should be rendered");
});
QUnit.test("View Extension", function (assert) {
    assert.ok(!document.getElementById("theComponent---mainView--sub2View--customFrag1BtnWithCustAction"), "View Extension should not be rendered");
});
QUnit.test("Controller Extension", function (assert) {
    assert.equal(aLifeCycleCalls.length, 3, "3 lifecycle methods should be called");
    assert.equal(aLifeCycleCalls[0], "Sub2 Controller onInit()", "1st lifecycle method to be called should be: Sub2 Controller onInit()");
    assert.equal(aLifeCycleCalls[1], "Sub2 Controller onBeforeRendering()", "1st lifecycle method to be called should be: Sub2 Controller onBeforeRendering()");
    assert.equal(aLifeCycleCalls[2], "Sub2 Controller onAfterRendering()", "2nd lifecycle method to be called should be: Sub2 Controller onAfterRendering()");
    assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should not have been called yet");
    assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should not have been called yet");
    qutils.triggerEvent("click", "theComponent---mainView--sub2View--standardBtnWithStandardAction");
    assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
    assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should still not have been called");
    var oController = sap.ui.getCore().byId("theComponent---mainView--sub2View").getController();
    assert.ok(oController, "Extended Sub2 View should have a Controller");
    assert.ok(oController.originalSAPAction, "Extended Sub2 controller should have an originalSAPAction method");
    assert.ok(!oController.customerAction, "Extended Sub2 controller should have no customerAction method");
    assert.equal(oController.originalSAPAction(), "ori", "originalSAPAction method of extended controller should return 'ori'");
});
QUnit.test("Controller Extension (sap.ui.controller)", function (assert) {
    oComp.runAsOwner(function () {
        var oController = sap.ui.controller("testdata.customizing.sap.Sub2");
        assert.ok(oController.isExtended === undefined, "Controller has not been extended with sap.ui.controller factory function!");
    });
});
QUnit.test("Controller Extension (Code Extensibility)", function (assert) {
    assert.equal(oLifecycleSpy.callCount, 6, "6 lifecycle methods should be called");
    assert.equal(oLifecycleSpy.getCall(0).args[0], "Sub6 Controller onInit()", "1st lifecycle method to be called should be: Sub6 Controller onInit()");
    assert.equal(oLifecycleSpy.getCall(1).args[0], "Sub6 Controller onInit()", "2nd lifecycle method to be called should be: Sub6 Controller onInit() - View included 2nd time");
    assert.equal(oLifecycleSpy.getCall(2).args[0], "Sub6 Controller onBeforeRendering()", "3rd lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering()");
    assert.equal(oLifecycleSpy.getCall(3).args[0], "Sub6 Controller onBeforeRendering()", "4th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering() - View included 2nd time");
    assert.equal(oLifecycleSpy.getCall(4).args[0], "Sub6 Controller onAfterRendering()", "5th lifecycle method to be called should be: Sub6 Controller onAfterRendering()");
    assert.equal(oLifecycleSpy.getCall(5).args[0], "Sub6 Controller onAfterRendering()", "6th lifecycle method to be called should be: Sub6 Controller onAfterRendering() - View included 2nd time");
});
QUnit.test("Property Modifications", function (assert) {
    var oControl = sap.ui.getCore().byId("theComponent---mainView--sub3View--customizableText");
    assert.strictEqual(oControl.getVisible(), true, "'visible' property should not be customized");
    assert.strictEqual(oControl.getEnabled(), true, "'enabled' property should not be customized");
});
QUnit.test("ExtensionPoint default content", function (assert) {
    var oFirstItem = sap.ui.getCore().byId("__item0-theComponent---mainView--sub2View--lb-0");
    assert.ok(oFirstItem, "First ListItem should exist");
    assert.ok(oFirstItem.getDomRef(), "First ListItem should be rendered");
    assert.equal(oFirstItem.getAdditionalText(), "(Original SAP ListItem)", "First ListItem should be the default one");
});