import openWindow from "sap/ui/util/openWindow";
QUnit.module("sap/ui/util/openWindow");
QUnit.test("Noopener noreferrer", function (assert) {
    var oStubWindowOpen = sinon.sandbox.stub(window, "open");
    openWindow("about:blank", "newWindow");
    assert.ok(oStubWindowOpen.calledWith("about:blank", "newWindow", "noopener,noreferrer"), "window.open is called with predefined windowFeatures");
});