import Log from "sap/base/Log";
import Control from "sap/ui/core/Control";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import FormatException from "sap/ui/model/FormatException";
import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
import ODataType from "sap/ui/model/odata/type/ODataType";
import Single from "sap/ui/model/odata/type/Single";
import TestUtils from "sap/ui/test/TestUtils";
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
QUnit.module("sap.ui.model.odata.type.Single", {
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
QUnit.test("basics", function (assert) {
    var oType = new Single();
    assert.ok(oType instanceof Single, "is a Single");
    assert.ok(oType instanceof ODataType, "is an ODataType");
    assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Single", "type name");
    assert.strictEqual(oType.oFormatOptions, undefined, "default format options");
    assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
    assert.strictEqual(oType.oConstraints, undefined, "default constraints");
    assert.strictEqual(oType.oFormat, null, "no formatter preload");
});
QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints", function (assert) {
    var oType = new Single(null, null);
    assert.deepEqual(oType.oFormatOptions, null, "no format options");
    assert.deepEqual(oType.oConstraints, undefined, "default constraints");
});
[
    undefined,
    {},
    { preserveDecimals: true },
    { preserveDecimals: "yes" },
    { preserveDecimals: undefined },
    { preserveDecimals: null },
    { preserveDecimals: false }
].forEach(function (oFormatOptions, i) {
    QUnit.test("constructor: oFormatOptions.preserveDecimals; #" + i, function (assert) {
        var oType = new Single(oFormatOptions);
        assert.strictEqual(oType.oFormatOptions, oFormatOptions);
    });
});
[
    { i: {}, o: undefined },
    { i: { nullable: true }, o: undefined },
    { i: { nullable: false }, o: { nullable: false } },
    { i: { nullable: "true" }, o: undefined },
    { i: { nullable: "false" }, o: { nullable: false } },
    { i: { nullable: "foo" }, o: undefined, warning: "Illegal nullable: foo" }
].forEach(function (oFixture) {
    QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
        var oType;
        if (oFixture.warning) {
            this.oLogMock.expects("warning").withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.Single");
        }
        oType = new Single({}, oFixture.i);
        assert.deepEqual(oType.oConstraints, oFixture.o);
    });
});
QUnit.test("format: English", function (assert) {
    var oType = new Single();
    assert.strictEqual(oType.formatValue(0, "string"), "0", "0");
    assert.strictEqual(oType.formatValue(9999999, "string"), "9,999,999", "99999999");
    assert.strictEqual(oType.formatValue(-9999999, "string"), "-9,999,999", "-99999999");
    assert.strictEqual(oType.formatValue(1e-7, "string"), "0.0000001", "0.0000001");
    assert.strictEqual(oType.formatValue(Math.fround(1.6), "string"), "1.6", "1.6");
    assert.strictEqual(oType.formatValue(1.2345678, "string"), "1.234568", "1.2345678 toPrecision(7)");
    assert.strictEqual(oType.formatValue(1234567.8, "string"), "1,234,568", "1234567.8 toPrecision(7)");
    assert.strictEqual(oType.formatValue("1.5", "any"), "1.5", "target type any");
    assert.strictEqual(oType.formatValue("9999999", "string"), "9,999,999", "99999999 as String");
    assert.strictEqual(oType.formatValue("1.25", "float"), 1.25, "target type float");
    assert.strictEqual(oType.formatValue("12.34", "int"), 12, "target type int");
    assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
    assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
    assert.strictEqual(oType.formatValue(1.5, "any"), 1.5, "target type any");
    assert.strictEqual(oType.formatValue(1.25, "float"), 1.25, "target type float");
    assert.strictEqual(oType.formatValue(12.34, "int"), 12, "target type int");
    try {
        oType.formatValue(12.34, "boolean");
        assert.ok(false);
    }
    catch (e) {
        assert.ok(e instanceof FormatException);
        assert.strictEqual(e.message, "Don't know how to format sap.ui.model.odata.type.Single to boolean");
    }
    this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").returns("string");
    assert.strictEqual(oType.formatValue(9999999, "sap.ui.core.CSSSize"), "9,999,999");
});
QUnit.test("parse", function (assert) {
    var oType = new Single();
    assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
    assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
    assert.strictEqual(oType.parseValue(" 1,000.234", "string"), Math.fround(1000.234), "type string ' 1,000.234'");
    assert.strictEqual(oType.parseValue(" -12,345.6", "string"), Math.fround(-12345.6), "type string ' -12,345.6'");
    assert.strictEqual(oType.parseValue("0.12345678", "string"), Math.fround(0.12345678), "type string, round to precision");
    assert.strictEqual(oType.parseValue(1234, "int"), 1234, "type int");
    assert.strictEqual(oType.parseValue(1234.56, "float"), Math.fround(1234.56), "type float");
    try {
        oType.parseValue(true, "boolean");
        assert.ok(false);
    }
    catch (e) {
        assert.ok(e instanceof ParseException);
        assert.strictEqual(e.message, "Don't know how to parse sap.ui.model.odata.type.Single from boolean");
    }
    this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").returns("string");
    assert.strictEqual(oType.parseValue(" 1,000.234", "sap.ui.core.CSSSize"), Math.fround(1000.234));
});
QUnit.test("values rounded", function (assert) {
    var oType = new Single();
    assert.strictEqual(oType.formatValue(oType.parseValue("0.12345678", "string"), "string"), "0.1234568");
});
QUnit.test("parse: user error", function (assert) {
    TestUtils.withNormalizedMessages(function () {
        var oType = new Single();
        try {
            oType.parseValue("foo", "string");
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof ParseException);
            assert.strictEqual(e.message, "EnterNumber");
        }
    });
});
QUnit.test("validate success", function (assert) {
    var oType = new Single();
    [null, 0, -0, -100000, -9999999].forEach(function (sValue) {
        oType.validateValue(sValue);
        assert.ok(true, sValue);
    });
});
[false, null, {}, "foo"].forEach(function (sValue) {
    QUnit.test("validate errors: " + JSON.stringify(sValue), function (assert) {
        TestUtils.withNormalizedMessages(function () {
            var oType = new Single({}, { nullable: false });
            try {
                oType.validateValue(sValue);
                assert.ok(false);
            }
            catch (e) {
                assert.ok(e instanceof ValidateException);
                assert.strictEqual(e.message, "EnterNumber");
            }
        });
    });
});
QUnit.test("localization change", function (assert) {
    var oControl = new Control(), oType = new Single();
    oControl.bindProperty("tooltip", { path: "/unused", type: oType });
    assert.strictEqual(oType.formatValue(1234, "string"), "1,234", "before language change");
    sap.ui.getCore().getConfiguration().setLanguage("de-CH");
    assert.strictEqual(oType.formatValue(1234, "string"), "1\u2019234", "adjusted to changed language");
});
[{
        set: undefined,
        expect: { groupingEnabled: true, preserveDecimals: true }
    }, {
        set: {},
        expect: { groupingEnabled: true, preserveDecimals: true }
    }, {
        set: { preserveDecimals: true },
        expect: { groupingEnabled: true, preserveDecimals: true }
    }, {
        set: { preserveDecimals: "yes" },
        expect: { groupingEnabled: true, preserveDecimals: "yes" }
    }, {
        set: { preserveDecimals: undefined },
        expect: { groupingEnabled: true, preserveDecimals: undefined }
    }, {
        set: { preserveDecimals: null },
        expect: { groupingEnabled: true, preserveDecimals: null }
    }, {
        set: { preserveDecimals: false },
        expect: { groupingEnabled: true, preserveDecimals: false }
    }, {
        set: { style: "short" },
        expect: { groupingEnabled: true, style: "short" }
    }, {
        set: { style: "long" },
        expect: { groupingEnabled: true, style: "long" }
    }, {
        set: { style: "standard" },
        expect: { groupingEnabled: true, preserveDecimals: true, style: "standard" }
    }, {
        set: { preserveDecimals: true, style: "short" },
        expect: { groupingEnabled: true, preserveDecimals: true, style: "short" }
    }, {
        set: { preserveDecimals: true, style: "long" },
        expect: { groupingEnabled: true, preserveDecimals: true, style: "long" }
    }, {
        set: { foo: "bar" },
        expect: { foo: "bar", groupingEnabled: true, preserveDecimals: true }
    }, {
        set: { decimals: 3, groupingEnabled: false },
        expect: { decimals: 3, groupingEnabled: false, preserveDecimals: true }
    }, {
        set: { maxFractionDigits: 3 },
        expect: { groupingEnabled: true, maxFractionDigits: 3, preserveDecimals: true }
    }].forEach(function (oFixture) {
    QUnit.test("formatOptions: " + JSON.stringify(oFixture.set), function (assert) {
        var oSpy, oType = new Single(oFixture.set);
        assert.deepEqual(oType.oFormatOptions, oFixture.set);
        oSpy = this.spy(NumberFormat, "getFloatInstance");
        oType.formatValue(42, "string");
        sinon.assert.calledWithExactly(oSpy, oFixture.expect);
    });
});
QUnit.test("format: bad input type", function (assert) {
    var oBadModelValue = new Date(), oType = new Single();
    ["string", "int", "float"].forEach(function (sTargetType) {
        assert.throws(function () {
            oType.formatValue(oBadModelValue, sTargetType);
        }, new FormatException("Illegal " + oType.getName() + " value: " + oBadModelValue));
    });
    assert.strictEqual(oType.formatValue(oBadModelValue, "any"), oBadModelValue);
});