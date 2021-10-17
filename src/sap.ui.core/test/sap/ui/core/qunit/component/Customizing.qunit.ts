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
function createComponentAndContainer() {
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
}
function destroyComponentAndContainer() {
    oComp.destroy();
    oCompCont.destroy();
}
QUnit.module("Customizing", {
    before: createComponentAndContainer,
    after: destroyComponentAndContainer
});
QUnit.test("View Replacement", function (assert) {
    assert.ok(document.getElementById("theComponent---mainView--sub1View--customTextInCustomSub1"), "Replacement XMLView should be rendered");
    assert.ok(!document.getElementById("theComponent---mainView--sub1View--originalSapTextInSub1"), "Original XMLView should not be rendered");
});
QUnit.test("View Extension", function (assert) {
    assert.ok(document.getElementById("theComponent---mainView--sub2View--customFrag1BtnWithCustAction"), "XMLView Extension should be rendered");
    assert.ok(document.getElementById("buttonWithCustomerAction"), "JSView Extension should be rendered");
    assert.ok(document.getElementById("__jsview1--customerButton1"), "Extension within Extension Point should be rendered");
    assert.ok(document.getElementById("theComponent---mainView--customFrag1Btn"), "Extension within Fragment without id should be rendered");
    assert.ok(document.getElementById("theComponent---mainView--frag1--customFrag1Btn"), "Extension within Fragment should be rendered");
    assert.ok(document.getElementById("theComponent---mainView--sub2View--customSubSubView1"), "XMLView Extension should be rendered");
    assert.ok(document.getElementById("theComponent---mainView--sub2View--customSubSubView1--customFrag1Btn"), "Button of XMLView Extension should be rendered");
    assert.ok(document.getElementById("theComponent---mainView--sub2View--customFrag21Btn"), "Button of XMLView Extension inside html Control should be rendered");
});
QUnit.test("Controller Replacement", function (assert) {
    assert.equal(sap.ui.getCore().byId("theComponent---mainView").getController().getMetadata().getName(), "testdata.customizing.customer.Main", "The controller has been replaced");
});
QUnit.test("Controller Extension", function (assert) {
    assert.equal(aLifeCycleCalls.length, 6, "6 lifecycle methods should be called");
    assert.equal(aLifeCycleCalls[0], "Sub2 Controller onInit()", "1st lifecycle method to be called should be: Sub2 Controller onInit()");
    assert.equal(aLifeCycleCalls[1], "Sub2ControllerExtension Controller onInit()", "2nd lifecycle method to be called should be: Sub2ControllerExtension Controller onInit()");
    assert.equal(aLifeCycleCalls[2], "Sub2ControllerExtension Controller onBeforeRendering()", "3rd lifecycle method to be called should be: Sub2ControllerExtension Controller onBeforeRendering()");
    assert.equal(aLifeCycleCalls[3], "Sub2 Controller onBeforeRendering()", "4th lifecycle method to be called should be: Sub2 Controller onBeforeRendering()");
    assert.equal(aLifeCycleCalls[4], "Sub2 Controller onAfterRendering()", "5th lifecycle method to be called should be: Sub2 Controller onAfterRendering()");
    assert.equal(aLifeCycleCalls[5], "Sub2ControllerExtension Controller onAfterRendering()", "6th lifecycle method to be called should be: Sub2ControllerExtension Controller onAfterRendering()");
    assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should not have been called yet");
    assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should not have been called yet");
    qutils.triggerEvent("click", "theComponent---mainView--sub2View--customFrag1BtnWithCustAction");
    assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should still not have been called");
    assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should have been called now");
    qutils.triggerEvent("click", "theComponent---mainView--sub2View--standardBtnWithStandardAction");
    assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
    assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should not have been called again");
    var oController = sap.ui.getCore().byId("theComponent---mainView--sub2View").getController();
    assert.ok(oController, "Extended Sub2 View should have a Controller");
    assert.ok(oController.originalSAPAction, "Extended Sub2 controller should have an originalSAPAction method");
    assert.ok(oController.customerAction, "Extended Sub2 controller should have a customerAction method");
    assert.equal(oController.originalSAPAction(), "ext", "originalSAPAction method of extended controller should return 'ext'");
});
QUnit.test("Controller Extension (sap.ui.controller)", function (assert) {
    oComp.runAsOwner(function () {
        var oController = sap.ui.controller("testdata.customizing.sap.Sub2");
        assert.ok(oController.isExtended, "Controller has been extended with sap.ui.controller factory function!");
    });
});
QUnit.test("Controller Extension (Code Extensibility)", function (assert) {
    assert.equal(oLifecycleSpy.callCount, 15, "15 lifecycle methods should be called");
    assert.equal(oLifecycleSpy.getCall(0).args[0], "Sub6 Controller onInit()", "1st lifecycle method to be called should be: Sub6 Controller onInit()");
    assert.equal(oLifecycleSpy.getCall(1).args[0], "Sub6InstanceSpecificControllerExtension Controller onInit()", "2nd lifecycle method to be called should be: Sub6InstanceSpecificControllerExtension Controller onInit()");
    assert.equal(oLifecycleSpy.getCall(2).args[0], "Sub6 Controller onInit()", "Strich: 3rd lifecycle method to be called should be: Sub6ControllerExtension Controller onInit()");
    assert.equal(oLifecycleSpy.getCall(3).args[0], "Sub6ControllerExtension Controller onInit()", "Strich: 4th lifecycle method to be called should be: Sub6ControllerExtension Controller onInit()");
    assert.equal(oLifecycleSpy.getCall(4).args[0], "Sub6AnotherControllerExtension Controller onInit()", "Strich: 5th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onInit()");
    assert.equal(oLifecycleSpy.getCall(5).args[0], "Sub6InstanceSpecificControllerExtension Controller onBeforeRendering()", "6th lifecycle method to be called should be: Sub6InstanceSpecificExtensionController onBeforeRendering()");
    assert.equal(oLifecycleSpy.getCall(6).args[0], "Sub6 Controller onBeforeRendering()", "7th lifecycle method to be called should be: Sub6 Controller onBeforeRendering()");
    assert.equal(oLifecycleSpy.getCall(7).args[0], "Sub6AnotherControllerExtension Controller onBeforeRendering()", "Strich: 8th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering()");
    assert.equal(oLifecycleSpy.getCall(8).args[0], "Sub6ControllerExtension Controller onBeforeRendering()", "Strich: 9th lifecycle method to be called should be: Sub6ControllerExtension Controller onBeforeRendering()");
    assert.equal(oLifecycleSpy.getCall(9).args[0], "Sub6 Controller onBeforeRendering()", "Strich: 10th lifecycle method to be called should be: Sub6 Controller onBeforeRendering()");
    assert.equal(oLifecycleSpy.getCall(10).args[0], "Sub6 Controller onAfterRendering()", "11th lifecycle method to be called should be: Sub6 Controller onAfterRendering()");
    assert.equal(oLifecycleSpy.getCall(11).args[0], "Sub6InstanceSpecificControllerExtension Controller onAfterRendering()", "12th lifecycle method to be called should be: Sub6InstanceSpecificControllerExtension Controller onAfterRendering()");
    assert.equal(oLifecycleSpy.getCall(12).args[0], "Sub6 Controller onAfterRendering()", "Strich: 13th lifecycle method to be called should be: Sub6 Controller onAfterRendering()");
    assert.equal(oLifecycleSpy.getCall(13).args[0], "Sub6ControllerExtension Controller onAfterRendering()", "Strich: 14th lifecycle method to be called should be: Sub6ControllerExtension Controller onAfterRendering()");
    assert.equal(oLifecycleSpy.getCall(14).args[0], "Sub6AnotherControllerExtension Controller onAfterRendering()", "Strich: 15th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onAfterRendering()");
});
QUnit.test("Property Modifications", function (assert) {
    var oControl = sap.ui.getCore().byId("theComponent---mainView--sub3View--customizableText");
    assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
    assert.strictEqual(oControl.getEnabled(), true, "'enabled' property should not be customizable");
    oControl = sap.ui.getCore().byId("theComponent---mainView--sub2View--btnToHide");
    assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
});
QUnit.test("ExtensionPoint default content", function (assert) {
    var oFirstItem = sap.ui.getCore().byId("__item0-theComponent---mainView--sub2View--lb-0");
    assert.ok(oFirstItem, "First ListItem should exist");
    assert.ok(oFirstItem.getDomRef(), "First ListItem should be rendered");
    assert.equal(oFirstItem.getText(), "(Customer's replacement ListItem)", "First ListItem should be the customized one");
    assert.ok(sap.ui.getCore().byId("__jsview0--defaultContentTextView"), "JS extension point 1 should contain default content");
    assert.ok(sap.ui.getCore().byId("iHaveCausedDestruction"), "JS Extension Point 45 Content has been correctly replaced");
});
QUnit.module("Controller Customizing via Hook", {
    beforeEach: function (assert) {
        iStandardSub2ControllerCalled = 0;
        iCustomSub2ControllerCalled = 0;
        aLifeCycleCalls.length = 0;
        var bOriginalSAPActionCalled = false;
        var bCustomerActionCalled = false;
        var that = this;
        this.getControllerExtensions = function (sControllerName, sComponentId) {
            if (!(sControllerName == "testdata.customizing.sap.Sub2")) {
                return [];
            }
            else {
                return [{
                        onInit: function () {
                            assert.equal(aLifeCycleCalls[0], "Sub2 Controller onInit()", "1st lifecycle method to be called should be: Sub2 Controller onInit()");
                            assert.equal(aLifeCycleCalls[1], "Sub2ControllerExtension Controller onInit()", "2nd lifecycle method to be called should be: Sub2ControllerExtension Controller onInit()");
                            aLifeCycleCalls.push("ControllerExtension onInit()");
                            assert.equal(Component.getOwnerIdFor(this.byId("standardBtnWithStandardAction")), this.getOwnerComponent().getId(), "Propagation of owner component to view creation works!");
                        },
                        onBeforeRendering: function () {
                            assert.equal(aLifeCycleCalls.length, 3, "ControllerExtension lifecycle method execution count is correct!");
                            assert.equal(aLifeCycleCalls[2], "ControllerExtension onInit()", "3nd lifecycle method to be called should be: ControllerExtension onInit()");
                            aLifeCycleCalls.push("ControllerExtension onBeforeRendering()");
                        },
                        onAfterRendering: function () {
                            assert.equal(aLifeCycleCalls.length, 8, "ControllerExtension lifecycle method execution count is correct!");
                            assert.equal(aLifeCycleCalls[3], "ControllerExtension onBeforeRendering()", "4th lifecycle method to be called should be: ControllerExtension onBeforeRendering()");
                            assert.equal(aLifeCycleCalls[4], "Sub2ControllerExtension Controller onBeforeRendering()", "5th lifecycle method to be called should be: Sub2ControllerExtension Controller onBeforeRendering()");
                            assert.equal(aLifeCycleCalls[5], "Sub2 Controller onBeforeRendering()", "6th lifecycle method to be called should be: Sub2 Controller onBeforeRendering()");
                            assert.equal(aLifeCycleCalls[6], "Sub2 Controller onAfterRendering()", "7th lifecycle method to be called should be: Sub2 Controller onAfterRendering()");
                            assert.equal(aLifeCycleCalls[7], "Sub2ControllerExtension Controller onAfterRendering()", "8th lifecycle method to be called should be: Sub2ControllerExtension Controller onAfterRendering()");
                            aLifeCycleCalls.push("ControllerExtension onAfterRendering()");
                            qutils.triggerEvent("click", "theComponent---mainView--sub2View--standardBtnWithStandardAction");
                            assert.ok(bOriginalSAPActionCalled, "ControllerExtension custom event handler 'originalSAPAction' called!");
                            assert.equal(iStandardSub2ControllerCalled, 0, "Original event handler 'originalSAPAction' is not called!");
                            qutils.triggerEvent("click", "theComponent---mainView--sub2View--customFrag1BtnWithCustAction");
                            assert.ok(bCustomerActionCalled, "ControllerExtension custom event handler 'customerAction' called!");
                            assert.equal(iCustomSub2ControllerCalled, 0, "Original event handler 'customerAction' is not called!");
                            setTimeout(function () {
                                oComp.destroy();
                            }, 100);
                        },
                        onExit: function () {
                            assert.equal(aLifeCycleCalls.length, 9, "ControllerExtension lifecycle method execution count is correct!");
                            assert.equal(aLifeCycleCalls[8], "ControllerExtension onAfterRendering()", "9th lifecycle method to be called should be: ControllerExtension onAfterRendering()");
                            aLifeCycleCalls.push("ControllerExtension onExit()");
                            setTimeout(function () {
                                assert.equal(aLifeCycleCalls.length, 12, "ControllerExtension lifecycle method execution count is correct!");
                                assert.equal(aLifeCycleCalls[9], "ControllerExtension onExit()", "9th lifecycle method to be called should be: ControllerExtension onExit()");
                                assert.equal(aLifeCycleCalls[10], "Sub2ControllerExtension Controller onExit()", "10th lifecycle method to be called should be: Sub2ControllerExtension Controller onExit()");
                                assert.equal(aLifeCycleCalls[11], "Sub2 Controller onExit()", "11th lifecycle method to be called should be: Sub2 Controller onExit()");
                                that.done();
                            }, 100);
                        },
                        originalSAPAction: function () {
                            bOriginalSAPActionCalled = true;
                        },
                        customerAction: function () {
                            bCustomerActionCalled = true;
                        }
                    }];
            }
        };
    },
    afterEach: destroyComponentAndContainer
});
QUnit.test("Register ExtensionProvider (sync)", function (assert) {
    assert.expect(21);
    this.done = assert.async();
    var that = this;
    sap.ui.predefine("sap/my/sync/ExtensionProvider", [], function () {
        var ExtensionProvider = function () { };
        ExtensionProvider.prototype.getControllerExtensions = that.getControllerExtensions;
        return ExtensionProvider;
    }, true);
    Controller.registerExtensionProvider("sap.my.sync.ExtensionProvider");
    return createComponentAndContainer();
});
QUnit.test("Register ExtensionProvider (async)", function (assert) {
    assert.expect(21);
    this.done = assert.async();
    var fnOrg = View.prototype._initCompositeSupport;
    View.prototype._initCompositeSupport = function (mSettings) {
        if (mSettings.viewName == "testdata.customizing.sap.Sub2") {
            mSettings.async = true;
        }
        return fnOrg.call(this, mSettings);
    };
    var that = this;
    sap.ui.predefine("sap/my/async/ExtensionProvider", [], function () {
        var ExtensionProvider = function () { };
        ExtensionProvider.prototype.getControllerExtensions = function (sControllerName, sComponentId) {
            if (!(sControllerName == "testdata.customizing.sap.Sub2")) {
                return [];
            }
            else {
                return new Promise(function (fnResolve, fnReject) {
                    setTimeout(function () {
                        fnResolve(that.getControllerExtensions(sControllerName, sComponentId));
                    }, 500);
                });
            }
        };
        return ExtensionProvider;
    }, true);
    Controller.registerExtensionProvider("sap.my.async.ExtensionProvider");
    return createComponentAndContainer();
});