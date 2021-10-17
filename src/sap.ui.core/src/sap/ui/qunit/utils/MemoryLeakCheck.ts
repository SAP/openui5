import jQuery from "jquery.sap.global";
import Element from "sap/ui/core/Element";
import Control from "sap/ui/core/Control";
export class MemoryLeakCheck {
    static checkControl(sControlName: any, fnControlFactory: any, fnSomeAdditionalFunction: any, bControlCannotRender: any) {
        if (typeof sControlName !== "string") {
            bControlCannotRender = fnSomeAdditionalFunction;
            fnSomeAdditionalFunction = fnControlFactory;
            fnControlFactory = sControlName;
            sControlName = "[some control, id: " + Math.random() + " - please update your test to also pass the control name]";
        }
        if (fnSomeAdditionalFunction === true || fnSomeAdditionalFunction === false) {
            bControlCannotRender = fnSomeAdditionalFunction;
            fnSomeAdditionalFunction = undefined;
        }
        var mOriginalElements;
        QUnit.module("MemoryLeakCheck.checkControl: " + sControlName, {
            beforeEach: function () {
                mOriginalElements = getAllAliveControls();
            },
            afterEach: function (assert) {
                Element.registry.forEach(function (oControl, sId) {
                    if (!mOriginalElements[sId]) {
                        assert.ok(oControl.getMetadata().getName(), "Cleanup of id: " + sId + ", control: " + oControl.getMetadata().getName());
                        oControl.destroy();
                    }
                });
            }
        });
        QUnit.test("MemoryLeakCheck.checkControl(fnControlFactory) should receive a control factory", function (assert) {
            assert.equal(typeof fnControlFactory, "function", "MemoryLeakCheck should have received a control factory");
            assert.ok(document.getElementById("qunit-fixture"), "the test page HTML should contain an element with ID 'qunit-fixture'");
        });
        _checkControl(sControlName, fnControlFactory, fnSomeAdditionalFunction, bControlCannotRender);
    }
}
jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.qunit.qunit-coverage");
QUnit.config.reorder = false;
function getAllAliveControls() {
    return Element.registry.all();
}
var fillControlProperties = function (oControl) {
    var mProperties = oControl.getMetadata().getAllProperties();
    for (var sPropertyName in mProperties) {
        if (oControl.isPropertyInitial(sPropertyName)) {
            var oProperty = mProperties[sPropertyName];
            try {
                oControl[oProperty._sMutator]("dummyValueForMemLeakTest");
            }
            catch (e) {
            }
        }
    }
    if (!oControl.getTooltip()) {
        oControl.setTooltip("test");
    }
};
var _checkControl = function (sControlName, fnControlFactory, fnSomeAdditionalFunction, bControlCannotRender) {
    QUnit.test("Control " + sControlName + " should not have any memory leaks", function (assert) {
        var oControl1 = fnControlFactory();
        assert.ok(oControl1, "calling fnControlFactory() should return something (a control)");
        assert.ok(oControl1 instanceof Control, "calling fnControlFactory() should return something that is really instanceof sap.ui.core.Control");
        if (oControl1.placeAt && !bControlCannotRender) {
            try {
                oControl1.getMetadata().getRenderer();
            }
            catch (e) {
                assert.ok(false, "Error: control does not have a renderer. If this is known, please set the 'bControlCannotRender' flag when calling MemoryLeakCheck.checkControl");
            }
        }
        fillControlProperties(oControl1);
        if (oControl1.placeAt && !bControlCannotRender) {
            try {
                oControl1.placeAt("qunit-fixture");
                sap.ui.getCore().applyChanges();
            }
            catch (e) {
                assert.ok(false, "Error: control has a renderer, but could not be rendered. If this is known, please set the 'bControlCannotRender' flag when calling MemoryLeakCheck.checkControl");
                throw e;
            }
        }
        if (fnSomeAdditionalFunction) {
            fnSomeAdditionalFunction(oControl1);
            sap.ui.getCore().applyChanges();
        }
        oControl1.destroy();
        sap.ui.getCore().applyChanges();
        var mPreElements = getAllAliveControls(), oControl2 = fnControlFactory();
        fillControlProperties(oControl2);
        if (oControl2.placeAt && !bControlCannotRender) {
            oControl2.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
            oControl2.rerender();
            sap.ui.getCore().applyChanges();
        }
        if (fnSomeAdditionalFunction) {
            fnSomeAdditionalFunction(oControl2);
            sap.ui.getCore().applyChanges();
        }
        oControl2.destroy();
        sap.ui.getCore().applyChanges();
        var mPostElements = getAllAliveControls();
        detectEqualElementsInControlList(assert, mPostElements, mPreElements, "Memory leak check should not find any leftover controls after creating two instances and rendering twice" + (fnSomeAdditionalFunction ? "\n(and calling fnSomeAdditionalFunction)" : ""));
    });
};
var detectEqualElementsInControlList = function (assert, mActual, mExpected, sMessage) {
    var aUnexpectedElements = [];
    for (var sId in mActual) {
        if (!mExpected[sId]) {
            aUnexpectedElements.push(mActual[sId]);
        }
    }
    for (var i = 0; i < aUnexpectedElements.length; i++) {
        if (typeof aUnexpectedElements[i].getText === "function") {
            aUnexpectedElements[i] += " (text: '" + aUnexpectedElements[i].getText() + "')";
        }
    }
    sMessage = sMessage + (aUnexpectedElements.length > 0 ? ". LEFTOVERS: " + aUnexpectedElements.join(", ") : "");
    assert.equal(aUnexpectedElements.length, 0, sMessage);
};