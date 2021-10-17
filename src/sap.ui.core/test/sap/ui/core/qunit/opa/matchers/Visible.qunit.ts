import Visible from "sap/ui/test/matchers/Visible";
import Button from "sap/m/Button";
QUnit.module("Visible", {
    beforeEach: function () {
        this.oVisibleMatcher = new Visible();
        this.oSpy = sinon.spy(this.oVisibleMatcher._oLogger, "debug");
        this.oButton = new Button();
        this.oButton.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
    },
    afterEach: function () {
        this.oButton.destroy();
    }
});
QUnit.test("Should not match a Button without domref", function (assert) {
    this.oButton.destroy();
    sap.ui.getCore().applyChanges();
    var oResult = this.oVisibleMatcher.isMatching(this.oButton);
    assert.ok(!oResult, "Control isn't matching");
    sinon.assert.calledWith(this.oSpy, sinon.match(/is not rendered/));
});
QUnit.test("Should not match an invisible Button", function (assert) {
    this.oButton.$().hide();
    var oResult = this.oVisibleMatcher.isMatching(this.oButton);
    assert.ok(!oResult, "Control isn't matching");
    sinon.assert.calledWith(this.oSpy, sinon.match(/is not visible/));
});
QUnit.test("Should not match an Button with style invisibility", function (assert) {
    this.oButton.$().css("visibility", "hidden");
    var oResult = this.oVisibleMatcher.isMatching(this.oButton);
    assert.ok(!oResult, "Should not match control with visibility: hidden");
    sinon.assert.calledWith(this.oSpy, sinon.match(/is not visible/));
});
QUnit.test("Should match a visible Button", function (assert) {
    var oResult = this.oVisibleMatcher.isMatching(this.oButton);
    assert.ok(oResult, "Control is matching");
    sinon.assert.notCalled(this.oSpy);
});