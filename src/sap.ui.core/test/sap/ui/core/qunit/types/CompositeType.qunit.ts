import Log from "sap/base/Log";
import CompositeType from "sap/ui/model/CompositeType";
import SimpleType from "sap/ui/model/SimpleType";
QUnit.module("sap.ui.model.CompositeType", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("basics", function (assert) {
    var oCompositeType = new CompositeType();
    assert.ok(oCompositeType instanceof SimpleType, "is a SimpleType");
    assert.ok(oCompositeType instanceof CompositeType, "is a CompositeType");
    assert.strictEqual(oCompositeType.getName(), "CompositeType", "type name");
    assert.deepEqual(oCompositeType.oConstraints, {}, "default constraints");
    assert.deepEqual(oCompositeType.oFormatOptions, {}, "default format options");
    assert.strictEqual(oCompositeType.bParseWithValues, false);
    assert.strictEqual(oCompositeType.bUseInternalValues, false);
    assert.strictEqual(oCompositeType.bUseRawValues, false);
});
QUnit.test("getPartsIgnoringMessages", function (assert) {
    assert.deepEqual(CompositeType.prototype.getPartsIgnoringMessages(), []);
});
QUnit.test("getUseRawValues", function (assert) {
    var oCompositeType = { bUseRawValues: "~bUseRawValues" };
    assert.strictEqual(CompositeType.prototype.getUseRawValues.call(oCompositeType), "~bUseRawValues");
});
QUnit.test("getUseInternalValues", function (assert) {
    var oCompositeType = { bUseInternalValues: "~bUseInternalValues" };
    assert.strictEqual(CompositeType.prototype.getUseInternalValues.call(oCompositeType), "~bUseInternalValues");
});
QUnit.test("getParseWithValues", function (assert) {
    var oCompositeType = { bParseWithValues: "~bParseWithValues" };
    assert.strictEqual(CompositeType.prototype.getParseWithValues.call(oCompositeType), "~bParseWithValues");
});