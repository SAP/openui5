import Log from "sap/base/Log";
import Currency from "sap/ui/model/odata/type/Currency";
import applyUnitMixin from "sap/ui/model/odata/type/UnitMixin";
import BaseCurrency from "sap/ui/model/type/Currency";
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
QUnit.module("sap.ui.model.odata.type.Currency", {
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
    var oMixin = {}, oType = new Currency();
    applyUnitMixin(oMixin, BaseCurrency);
    Object.keys(oMixin).forEach(function (sKey) {
        if (sKey !== "formatValue" && sKey !== "getFormatOptions" && sKey !== "getPartsIgnoringMessages" && sKey !== "getValidateException" && sKey !== "parseValue" && sKey !== "validateValue" && sKey !== "_applyUnitMixin") {
            assert.strictEqual(oType[sKey], oMixin[sKey], sKey);
        }
    });
});
QUnit.test("constructor", function (assert) {
    var oType = new Currency();
    assert.ok(oType instanceof Currency, "is a Currency");
    assert.ok(oType instanceof BaseCurrency, "is a sap.ui.model.type.Currency");
    assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Currency", "type name");
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
        var oType = new Currency(oFixture.formatOptions);
        assert.strictEqual(oType.oFormatOptions.preserveDecimals, oFixture.result);
    });
});
QUnit.test("formatValue and parseValue", function (assert) {
    var mCustomizing = {
        "BHD": { StandardCode: "BHD", UnitSpecificScale: 3 },
        "EUR": { StandardCode: "EUR", UnitSpecificScale: 2 }
    }, oType = new Currency();
    assert.strictEqual(oType.formatValue([42, "EUR", mCustomizing], "string"), "42.00\u00A0EUR");
    this.mock(BaseCurrency.prototype).expects("parseValue").withExactArgs("42 EUR", "string").on(oType).callThrough();
    assert.deepEqual(oType.parseValue("42 EUR", "string"), ["42", "EUR"]);
});
QUnit.test("formatValue and parseValue: empty field", function (assert) {
    var mCustomizing = {
        "EUR": { StandardCode: "EUR", UnitSpecificScale: 2 }
    }, oType = new Currency();
    oType.formatValue([null, null, mCustomizing], "string");
    this.mock(BaseCurrency.prototype).expects("parseValue").withExactArgs("42", "string").on(oType).callThrough();
    assert.deepEqual(oType.parseValue("42", "string"), ["42", undefined]);
});
QUnit.test("parseValue: no customizing", function (assert) {
    var oType = new Currency();
    oType.formatValue([null, null, null], "string");
    assert.deepEqual(oType.parseValue("42.123 EUR", "string"), ["42.123", "EUR"]);
});
QUnit.test("getCustomUnitForKey", function (assert) {
    var mCustomizing = {
        "BHD": { StandardCode: "BHD", UnitSpecificScale: 3 },
        "EUR": { StandardCode: "EUR", UnitSpecificScale: 2 }
    }, mCustomUnit = {
        decimals: 2,
        isoCode: "EUR"
    }, oType = new Currency();
    assert.deepEqual(oType.getCustomUnitForKey(mCustomizing, "EUR"), mCustomUnit);
});