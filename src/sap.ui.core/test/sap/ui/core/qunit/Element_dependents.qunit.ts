import Element from "sap/ui/core/Element";
import Control from "sap/ui/core/Control";
QUnit.module("Dependents", {
    beforeEach: function () {
        this.sandbox = sinon.sandbox.create();
        this.element = new Element();
        this.element.addDependent(new Control());
        this.element.addDependent(new Control());
        this.sandbox.spy(this.element, "invalidate");
    },
    afterEach: function (assert) {
        assert.notOk(this.element.invalidate.called, "then the element should not invalidate");
        this.element.destroy();
        this.sandbox.restore();
    }
});
QUnit.test("When an item is added...", function (assert) {
    this.element.addDependent(new Control());
});
QUnit.test("When an item is inserted...", function (assert) {
    this.element.insertDependent(new Control(), 0);
});
QUnit.test("When an item is removed...", function (assert) {
    this.element.removeDependent(0);
});
QUnit.test("When all items are removed...", function (assert) {
    this.element.removeAllDependents();
});
QUnit.test("When all items are destroyed...", function (assert) {
    this.element.destroyDependents();
});
QUnit.test("When an item is added twice...", function (assert) {
    this.element.addDependent(this.element.getDependents()[0]);
});
QUnit.test("When an item is inserted twice...", function (assert) {
    this.element.insertDependent(0, this.element.getDependents()[1]);
});
QUnit.test("When an item is destroyed...", function (assert) {
    this.element.getDependents()[0].destroy();
});
QUnit.test("When an item is moved...", function (assert) {
    var oOther = new Element();
    oOther.addDependent(this.element.getDependents()[0]);
});