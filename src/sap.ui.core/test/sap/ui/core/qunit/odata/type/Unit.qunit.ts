import Log from "sap/base/Log";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import Unit from "sap/ui/model/odata/type/Unit";
import applyUnitMixin from "sap/ui/model/odata/type/UnitMixin";
import BaseUnit from "sap/ui/model/type/Unit";
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
QUnit.module("sap.ui.model.odata.type.Unit", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        sap.ui.getCore().getConfiguration().setLanguage("en-US");
    },
    afterEach: function () {
        sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
    }
});
QUnit.test("mixin", function (assert) {
    var oMixin = {}, oType = new Unit();
    applyUnitMixin(oMixin, BaseUnit);
    Object.keys(oMixin).forEach(function (sKey) {
        if (sKey !== "formatValue" && sKey !== "getFormatOptions" && sKey !== "getPartsIgnoringMessages" && sKey !== "getValidateException" && sKey !== "parseValue" && sKey !== "validateValue" && sKey !== "_applyUnitMixin") {
            assert.strictEqual(oType[sKey], oMixin[sKey], sKey);
        }
    });
});
QUnit.test("constructor", function (assert) {
    var oType = new Unit();
    assert.ok(oType instanceof Unit, "is a Unit");
    assert.ok(oType instanceof BaseUnit, "is a sap.ui.model.type.Unit");
    assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Unit", "type name");
});
[
    { formatOptions: undefined, result: true },
    { formatOptions: {}, result: true },
    { formatOptions: { preserveDecimals: true }, result: true },
    { formatOptions: { preserveDecimals: "yes" }, result: "yes" },
    { formatOptions: { preserveDecimals: undefined }, result: undefined },
    { formatOptions: { preserveDecimals: null }, result: null },
    { formatOptions: { preserveDecimals: false }, result: false }
].forEach(function (oFixture, i) {
    QUnit.test("constructor: oFormatOptions.preserveDecimals; #" + i, function (assert) {
        var oType = new Unit(oFixture.formatOptions);
        assert.strictEqual(oType.oFormatOptions.preserveDecimals, oFixture.result);
    });
});
QUnit.test("formatValue and parseValue", function (assert) {
    var mCustomizing = {
        "G": { Text: "gram", UnitSpecificScale: 3 },
        "KG": { Text: "kilogram", UnitSpecificScale: 2 }
    }, oType = new Unit();
    assert.strictEqual(oType.formatValue([42, "KG", mCustomizing], "string"), "42.00 KG");
    this.mock(BaseUnit.prototype).expects("parseValue").withExactArgs("42 KG", "string").on(oType).callThrough();
    assert.deepEqual(oType.parseValue("42 KG", "string"), ["42", "KG"]);
});
QUnit.test("formatValue and parseValue: empty field", function (assert) {
    var mCustomizing = {
        "KG": { Text: "kilogram", UnitSpecificScale: 2 }
    }, oType = new Unit();
    oType.formatValue([null, null, mCustomizing], "string");
    this.mock(BaseUnit.prototype).expects("parseValue").withExactArgs("42", "string").on(oType).callThrough();
    assert.deepEqual(oType.parseValue("42", "string"), ["42", undefined]);
});
QUnit.test("parseValue: no customizing", function (assert) {
    var oType = new Unit();
    oType.formatValue([null, null, null], "string");
    assert.deepEqual(oType.parseValue("42.123 kg", "string"), ["42.123", "mass-kilogram"]);
});
QUnit.test("getCustomUnitForKey", function (assert) {
    var mCustomizing = {
        "G": { Text: "gram", UnitSpecificScale: 3 },
        "KG": { Text: "kilogram", UnitSpecificScale: 2 }
    }, mCustomUnit = {
        displayName: "kilogram",
        decimals: 2,
        "unitPattern-count-other": "{0} KG"
    }, oType = new Unit();
    this.mock(NumberFormat).expects("getDefaultUnitPattern").withExactArgs("KG").returns(mCustomUnit["unitPattern-count-other"]);
    assert.deepEqual(oType.getCustomUnitForKey(mCustomizing, "KG"), mCustomUnit);
});