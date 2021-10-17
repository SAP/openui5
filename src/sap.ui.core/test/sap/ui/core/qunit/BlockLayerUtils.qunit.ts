import Log from "sap/base/Log";
import Button from "sap/m/Button";
var oDIV = document.createElement("div");
oDIV.id = "content";
document.body.appendChild(oDIV);
function getSibling(oDomRef, sDirection) {
    return (sDirection == "prev") ? oDomRef.previousElementSibling : oDomRef.nextElementSibling;
}
function queryAll(selector) {
    return document.querySelectorAll(selector);
}
QUnit.module("CSS classes", {
    beforeEach: function () {
        this.oButton = new Button({
            text: "Press"
        }).placeAt("content");
        sap.ui.getCore().applyChanges();
    },
    afterEach: function () {
        this.oButton.destroy();
        sap.ui.getCore().applyChanges();
    }
});
QUnit.test("Static/Relative Positioning - Reset", function (assert) {
    var $button = this.oButton.$();
    $button.css("position", "static");
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBusy(true);
    assert.equal($button.css("position"), "relative", "css position attribute was changed to 'relative'");
    this.oButton.setBusy(false);
    assert.equal($button.css("position"), "static", "css position attribute was changed to 'static'");
});
QUnit.test("Static/Relative Positioning - NO Reset", function (assert) {
    var $button = this.oButton.$();
    $button.css("position", "fixed");
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBusy(true);
    assert.equal($button.css("position"), "fixed", "after setBusy(true) the position is still 'fixed'");
    this.oButton.setBusy(false);
    assert.equal($button.css("position"), "fixed", "after setBusy(false) the position is still 'fixed'");
});
QUnit.module("Toggle setBlocked and setBusy", {
    beforeEach: function (assert) {
        this.testOneTabbableSpanExists = function (oDomRef) {
            var oSiblingDomRef;
            oSiblingDomRef = getSibling(oDomRef, "prev");
            assert.equal(oSiblingDomRef.getAttribute("tabindex"), 0, "Previous tabbable span should be available.");
            var oPrevSiblingDomRef = getSibling(oSiblingDomRef, "prev");
            assert.ok(oPrevSiblingDomRef === null || oPrevSiblingDomRef.getAttribute("tabindex") === "0", "Only one previous tabbable span should be available");
            oSiblingDomRef = getSibling(oDomRef, "next");
            assert.equal(oSiblingDomRef.getAttribute("tabindex"), 0, "Next tabbable span should be available.");
            var oNextSiblingDomRef = getSibling(oSiblingDomRef, "next");
            assert.ok(oNextSiblingDomRef === null || oNextSiblingDomRef.getAttribute("tabindex") === "0", "Only one next tabbable span should be available");
        };
        this.testNoneTabbableSpanExists = function (oDomRef) {
            var oSiblingDomRef;
            oSiblingDomRef = getSibling(oDomRef, "prev");
            assert.ok(oSiblingDomRef === null || (oSiblingDomRef.getAttribute("tabindex") !== "0" && oSiblingDomRef.nodeName !== "SPAN"), "Previous tabbable span shouldn't be available.");
            oSiblingDomRef = getSibling(oDomRef, "next");
            assert.ok(oSiblingDomRef === null || (oSiblingDomRef.getAttribute("tabindex") !== "0" && oSiblingDomRef.nodeName !== "SPAN"), "Next tabbable span shouldn't be available.");
        };
        this.oButton = new Button({
            text: "Press"
        }).placeAt("content");
        sap.ui.getCore().applyChanges();
    },
    afterEach: function () {
        this.oButton.destroy();
        sap.ui.getCore().applyChanges();
    }
});
QUnit.test("setBlocked() \u2192 setBusy()", function (assert) {
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be available.");
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
});
QUnit.test("setBlocked(true) \u2192 setBusy(true) : setBlocked(false) \u2192 setBusy(false)", function (assert) {
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayer should be available.");
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    this.testNoneTabbableSpanExists(this.oButton.getDomRef());
});
QUnit.test("setBlocked(true) \u2192 setBusy(true) : setBusy(false) \u2192 setBlocked(false)", function (assert) {
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayer should be available.");
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
    this.testNoneTabbableSpanExists(this.oButton.getDomRef());
});
QUnit.test("setBusy(true) \u2192 setBlocked(true) : setBusy(false) \u2192 setBlocked(false)", function (assert) {
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be available.");
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
    this.testNoneTabbableSpanExists(this.oButton.getDomRef());
});
QUnit.test("setBusy(true) \u2192 setBlocked(true) : setBlock(false) \u2192 setBusy(false)", function (assert) {
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be available.");
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    this.testNoneTabbableSpanExists(this.oButton.getDomRef());
});
QUnit.test("setBlocked(true) \u2192 setBusy(true) : setBlocked(false) \u2192 setBlocked(true) \u2192 setBlocked(false)", function (assert) {
    var oLogSpy = sinon.spy(Log, "info");
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayer should be available.");
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be available.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be still available.");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.ok(oLogSpy.calledTwice, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be busy anymore");
    assert.ok(oLogSpy.calledThrice, "Info logged. Unblocking ignored since Busy Layer still exists.");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    oLogSpy.restore();
});
QUnit.test("setBlocked(true) \u2192 setBusy(true) : setBusy(false) \u2192 setBusy(true) \u2192 setBusy(false)", function (assert) {
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayer should be available.");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be available.");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 0, "BusyIndicator Animation should be visible.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 1, "BusyIndicator Animation should be hidden.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayerOnly class should be set again");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 0, "BusyIndicator Animation should be visible again.");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 1, "BusyIndicator Animation should be invisible ");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayerOnly class should be set again");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
});
QUnit.test("setBusy(true) \u2192 setBlocked(true) : setBusy(false) \u2192 setBusy(true) \u2192 setBusy(false)", function (assert) {
    var oLogSpy = sinon.spy(Log, "info");
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be available.");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 0, "BusyIndicator Animation should be visible.");
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.ok(oLogSpy.calledOnce, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 1, "BusyIndicator Animation should be invisible.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayerOnly class should be set again");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 0, "BusyIndicator Animation should be visible.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBusy(false);
    assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 1, "BusyIndicator Animation should be invisible.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 1, "BlockLayerOnly class should be set again");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    oLogSpy.restore();
});
QUnit.test("setBusy(true) \u2192 setBlocked(true) : setBlocked(false) \u2192 setBlocked(true) \u2192 setBlocked(false)", function (assert) {
    var oLogSpy = sinon.spy(Log, "info");
    this.oButton.setBusyIndicatorDelay(0);
    this.oButton.setBusy(true);
    assert.ok(this.oButton.getBusy(), "Button should be busy");
    assert.equal(queryAll(".sapUiLocalBusyIndicator").length, 1, "BusyIndicator should be available.");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 0, "BusyIndicator Animation should be visible.");
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.ok(oLogSpy.calledOnce, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked");
    assert.ok(oLogSpy.calledTwice, "Info logged. Unblocking ignored since Busy Layer still exists.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 0, "BusyIndicator Animation should be visible.");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(true);
    assert.ok(this.oButton.getBlocked(), "Button should be blocked");
    assert.ok(oLogSpy.calledThrice, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    this.oButton.setBlocked(false);
    assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked");
    assert.equal(oLogSpy.callCount, 4, "Info logged. Unblocking ignored since Busy Layer still exists.");
    assert.equal(queryAll(".sapUiBlockLayerOnly").length, 0, "BlockLayerOnly class shouldn't be set anymore");
    assert.equal(queryAll(".sapUiHiddenBusyIndicatorAnimation").length, 0, "BusyIndicator Animation should be visible.");
    this.testOneTabbableSpanExists(this.oButton.getDomRef());
    oLogSpy.restore();
});