import Log from "sap/base/Log";
import FormatException from "sap/ui/model/FormatException";
import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
import ODataType from "sap/ui/model/odata/type/ODataType";
import Raw from "sap/ui/model/odata/type/Raw";
QUnit.module("sap.ui.model.odata.type.Raw", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("basics", function (assert) {
    var oRaw = new Raw(undefined, undefined);
    assert.ok(oRaw instanceof ODataType, "is an ODataType");
    assert.strictEqual(oRaw.getName(), "sap.ui.model.odata.type.Raw");
    [undefined, false, true, 0, 1, null, {}, "", "foo"].forEach(function (vValue) {
        assert.strictEqual(oRaw.formatValue(vValue, "any"), vValue);
    });
    ["", "boolean", "int", "float", "object", "string"].forEach(function (sTargetType) {
        assert.throws(function () {
            oRaw.formatValue("", sTargetType);
        }, new FormatException("Type 'sap.ui.model.odata.type.Raw' does not support formatting"));
    });
    assert.throws(function () {
        oRaw.parseValue("", "string");
    }, new ParseException("Type 'sap.ui.model.odata.type.Raw' does not support parsing"));
    assert.throws(function () {
        oRaw.validateValue(null);
    }, new ValidateException("Type 'sap.ui.model.odata.type.Raw' does not support validating"));
    assert.throws(function () {
        return new Raw(false);
    }, new Error("Unsupported arguments"));
    assert.throws(function () {
        return new Raw(undefined, false);
    }, new Error("Unsupported arguments"));
    assert.throws(function () {
        return new Raw(undefined, undefined, undefined);
    }, new Error("Unsupported arguments"));
});