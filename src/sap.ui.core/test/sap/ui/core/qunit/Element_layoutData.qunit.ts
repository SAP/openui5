import Element from "sap/ui/core/Element";
import Control from "sap/ui/core/Control";
import LayoutData from "sap/ui/core/LayoutData";
QUnit.module("LayoutData", {
    beforeEach: function (assert) {
        this.sandbox = sinon.sandbox.create();
        this.spy = sinon.spy();
        this.element = new Element();
        this.parentElement = new (Element.extend("local.parentElement", {
            metadata: {
                aggregations: {
                    content: { name: "content", type: "sap.ui.core.Element", multiple: true }
                }
            }
        }))();
        this.parentElement.onLayoutDataChange = this.spy;
        this.layoutData = new LayoutData();
        this.parentElement.addContent(this.element);
    },
    afterEach: function (assert) {
        sinon.assert.calledOnce(this.spy);
        var oEvent = this.spy.args[0][0];
        assert.strictEqual(oEvent.srcControl, this.element);
        assert.equal(oEvent.type, "LayoutDataChange");
        this.parentElement.destroy();
        this.sandbox.restore();
    }
});
QUnit.test("fire LayoutDataChange event on setLayoutData", function (assert) {
    this.element.setLayoutData(this.layoutData);
});
QUnit.test("fire LayoutDataChange event on destroyLayoutData", function (assert) {
    this.element.destroyLayoutData();
});