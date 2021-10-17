import _Enabled from "sap/ui/test/matchers/_Enabled";
import Button from "sap/m/Button";
import Page from "sap/m/Page";
import Toolbar from "sap/m/Toolbar";
QUnit.module("_Enabled matcher", {
    beforeEach: function () {
        this.oButton = new Button("myButton");
        this.oPage = new Page("myPage");
        this.oToolbar = new Toolbar("myToolbar", {
            content: [this.oButton, this.oPage]
        });
        this.oToolbar.placeAt("qunit-fixture");
        this.oEnabledMatcher = new _Enabled();
        this.oSpy = sinon.spy(this.oEnabledMatcher._oLogger, "debug");
        sap.ui.getCore().applyChanges();
    },
    afterEach: function () {
        this.oSpy.restore();
        this.oToolbar.destroy();
        sap.ui.getCore().applyChanges();
    }
});
QUnit.test("Should match enabled control", function (assert) {
    assert.ok(this.oEnabledMatcher.isMatching(this.oButton));
    sinon.assert.notCalled(this.oSpy);
});
QUnit.test("Should not match disabled control", function (assert) {
    this.oButton.setEnabled(false);
    sap.ui.getCore().applyChanges();
    assert.ok(!this.oEnabledMatcher.isMatching(this.oButton));
    sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Button#myButton' is not enabled");
});
QUnit.test("Should not match control with disabled ancestor", function (assert) {
    this.oToolbar.setEnabled(false);
    sap.ui.getCore().applyChanges();
    assert.ok(!this.oEnabledMatcher.isMatching(this.oButton));
    sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Button#myButton' is not enabled");
});
QUnit.test("Should not match control when a parent is disabled and it has no Disabled propagator", function (assert) {
    this.oToolbar.setEnabled(false);
    sap.ui.getCore().applyChanges();
    assert.ok(!this.oEnabledMatcher.isMatching(this.oPage));
    sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Page#myPage' has a parent 'Element sap.m.Toolbar#myToolbar' that is not enabled");
});