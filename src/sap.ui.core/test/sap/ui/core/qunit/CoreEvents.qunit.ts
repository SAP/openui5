import TestButton from "sap/ui/testlib/TestButton";
QUnit.test("UI dirty state - initial", function (assert) {
    assert.equal(sap.ui.getCore().getUIDirty(), false, "UI should not be dirty initially");
});
QUnit.module("Basics", {
    beforeEach: function (assert) {
        this.handler = function () {
            assert.ok(true, "(UIUpdated event is fired)");
        };
        sap.ui.getCore().attachEvent("UIUpdated", this.handler);
        this.button = new TestButton("myButton");
    },
    afterEach: function () {
        this.button.destroy();
        sap.ui.getCore().detachEvent("UIUpdated", this.handler);
    }
});
QUnit.test("Attaching event handlers", function (assert) {
    assert.expect(0);
});
QUnit.test("Control creation", function (assert) {
    assert.expect(3);
    this.button.placeAt("qunit-fixture");
    assert.equal(sap.ui.getCore().getUIDirty(), true, "UI should be dirty after creating the button");
    sap.ui.getCore().applyChanges();
    assert.equal(sap.ui.getCore().getUIDirty(), false, "UI should be not dirty after applyChanges");
});
QUnit.test("UI dirty on control modification", function (assert) {
    assert.expect(6);
    this.button.placeAt("qunit-fixture");
    sap.ui.getCore().applyChanges();
    assert.equal(sap.ui.getCore().getUIDirty(), false, "UI should be not dirty after applyChanges");
    this.button.setText("new text");
    assert.equal(sap.ui.getCore().getUIDirty(), true, "UI should be dirty after setting the button text");
    var done = assert.async();
    setTimeout(function () {
        assert.equal(jQuery.sap.byId("myButton")[0].innerHTML, "new text", "button should have new text after setting the button text and some timeout");
        assert.equal(sap.ui.getCore().getUIDirty(), false, "UI should be not dirty after setting the button text and some timeout");
        done();
    }, 500);
});