import _Busy from "sap/ui/test/matchers/_Busy";
import Button from "sap/m/Button";
import Toolbar from "sap/m/Toolbar";
import Page from "sap/m/Page";
QUnit.module("_Busy", {
    beforeEach: function () {
        this.oButton = new Button();
        this.oToolbar = new Toolbar({
            content: [this.oButton]
        });
        this.oPage = new Page({
            content: [this.oToolbar]
        });
        this.oPage.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        this.oBusyMatcher = new _Busy();
        this.oSpy = sinon.spy(this.oBusyMatcher._oLogger, "debug");
    },
    afterEach: function () {
        this.oPage.destroy();
        sap.ui.getCore().applyChanges();
        this.oSpy.restore();
    }
});
QUnit.test("Should match when control is busy", function (assert) {
    this.oPage.setBusy(true);
    assert.ok(this.oBusyMatcher.isMatching(this.oPage));
    sinon.assert.calledWithMatch(this.oSpy, /Control 'Element sap.m.Page.*' is busy/);
});
QUnit.test("Should match when control has a busy parent", function (assert) {
    this.oPage.setBusy(true);
    assert.ok(this.oBusyMatcher.isMatching(this.oButton));
    sinon.assert.calledWithMatch(this.oSpy, /has a parent 'Element sap.m.Page.*' that is busy/);
});
QUnit.test("Should not match when control is not busy", function (assert) {
    assert.ok(!this.oBusyMatcher.isMatching(this.oButton));
    assert.ok(!this.oBusyMatcher.isMatching(this.oPage));
    sinon.assert.notCalled(this.oSpy);
});