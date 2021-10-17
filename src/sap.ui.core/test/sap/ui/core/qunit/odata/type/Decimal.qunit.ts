import Log from "sap/base/Log";
import Control from "sap/ui/core/Control";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import FormatException from "sap/ui/model/FormatException";
import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
import Decimal from "sap/ui/model/odata/type/Decimal";
import ODataType from "sap/ui/model/odata/type/ODataType";
import Float from "sap/ui/model/type/Float";
import TestUtils from "sap/ui/test/TestUtils";
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
QUnit.module("sap.ui.model.odata.type.Decimal", {
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
    var oType = new Decimal();
    assert.ok(oType instanceof Decimal, "is a Decimal");
    assert.ok(oType instanceof ODataType, "is an ODataType");
    assert.ok(!(oType instanceof Float), "is not a Float");
    assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Decimal", "type name");
    assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
    assert.strictEqual(oType.oConstraints, undefined, "default constraints");
    assert.strictEqual(oType.oFormatOptions, undefined, "default format options");
    assert.strictEqual(oType.oFormat, null, "no formatter preload");
});
QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints", function (assert) {
    var oType = new Decimal(null, null);
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
        var oType = new Decimal(oFormatOptions);
        assert.strictEqual(oType.oFormatOptions, oFormatOptions);
    });
});
[
    { i: { precision: 8, scale: 3 }, o: { precision: 8, scale: 3 } },
    { i: { precision: 3, scale: 3 }, o: { precision: 3, scale: 3 } },
    { i: { nullable: false, scale: 3 }, o: { nullable: false, scale: 3 } },
    { i: { nullable: "foo" }, o: undefined, warning: "Illegal nullable: foo" },
    { i: { precision: 8, scale: "foo" }, o: { precision: 8 }, warning: "Illegal scale: foo" },
    { i: { precision: 8, scale: -1 }, o: { precision: 8 }, warning: "Illegal scale: -1" },
    { i: { precision: "foo", scale: 3 }, o: { scale: 3 }, warning: "Illegal precision: foo" },
    { i: { precision: -1, scale: 3 }, o: { scale: 3 }, warning: "Illegal precision: -1" },
    { i: { precision: 0, scale: 3 }, o: { scale: 3 }, warning: "Illegal precision: 0" },
    { i: { precision: true }, o: undefined, warning: "Illegal precision: true" },
    { i: { precision: 2, scale: 3 }, o: { precision: 2, scale: Infinity }, warning: "Illegal scale: must be less than or equal to precision " + "(precision=2, scale=3)" },
    { i: { minimum: "foo" }, o: undefined, warning: "Illegal minimum: foo" },
    { i: { minimum: "foo123" }, o: undefined, warning: "Illegal minimum: foo123" },
    { i: { maximum: "1234,56" }, o: undefined, warning: "Illegal maximum: 1234,56" },
    { i: { maximum: "#1234.56" }, o: undefined, warning: "Illegal maximum: #1234.56" },
    { i: { minimumExclusive: "foo" }, o: undefined, warning: "Illegal minimumExclusive: foo" },
    { i: { maximumExclusive: "X" }, o: undefined, warning: "Illegal maximumExclusive: X" }
].forEach(function (oFixture) {
    QUnit.test("setConstraints(" + JSON.stringify(oFixture.i) + ")", function (assert) {
        var oType;
        if (oFixture.warning) {
            this.oLogMock.expects("warning").withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.Decimal");
        }
        oType = new Decimal({}, oFixture.i);
        assert.deepEqual(oType.oConstraints, oFixture.o);
    });
});
QUnit.test("format", function (assert) {
    var oType = new Decimal({}, {
        precision: 8,
        scale: 3
    });
    assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
    assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
    assert.strictEqual(oType.formatValue("1234", "any"), "1234", "target type any");
    assert.strictEqual(oType.formatValue("1234", "float"), 1234, "target type float");
    assert.strictEqual(oType.formatValue("1234.1", "int"), 1234, "target type int");
    assert.strictEqual(oType.formatValue("1234", "string"), "1,234.000", "target type string");
    assert.strictEqual(oType.formatValue("1234.1234", "string"), "1,234.1234", "decimals preserved");
    assert.strictEqual(oType.formatValue("123456", "string"), "123,456.000", "surpassing precision");
    try {
        oType.formatValue(12.34, "boolean");
        assert.ok(false);
    }
    catch (e) {
        assert.ok(e instanceof FormatException);
        assert.strictEqual(e.message, "Don't know how to format sap.ui.model.odata.type.Decimal to boolean");
    }
    this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").returns("string");
    assert.strictEqual(oType.formatValue("123456", "sap.ui.core.CSSSize"), "123,456.000");
});
[
    { i: "1.10", o: "1.1" },
    { i: "100", o: "100" },
    { i: "1.00", o: "1" },
    { i: 77, o: "77" }
].forEach(function (oFixture, i) {
    QUnit.test("BCP 188109/2020: format removes trailing zeroes, " + i, function (assert) {
        var oType = new Decimal({ minFractionDigits: 0, maxFractionDigits: 2 });
        assert.strictEqual(oType.formatValue(oFixture.i, "string"), oFixture.o);
    });
});
QUnit.test("parse", function (assert) {
    var oType = new Decimal();
    assert.strictEqual(oType.parseValue("1,234,567.89", "string"), "1234567.89", "multiple grouping separators");
    assert.strictEqual(oType.parseValue(" -12345 ", "string"), "-12345", "spaces");
    assert.strictEqual(oType.parseValue("0012345", "string"), "12345", "leading zeroes");
    assert.strictEqual(oType.parseValue("0", "string"), "0", "only 0");
    assert.strictEqual(oType.parseValue("1234500000", "string"), "1234500000", "trailing integer zeroes");
    assert.strictEqual(oType.parseValue("12345.00000", "string"), "12345", "trailing decimal zeroes");
    assert.strictEqual(oType.parseValue("12345.101010", "string"), "12345.10101", "trailing zero");
    assert.strictEqual(oType.parseValue(".1234", "string"), "0.1234", "no integer digits");
    assert.strictEqual(oType.parseValue("-1234.", "string"), "-1234", "decimal point w/o decimals");
    assert.throws(function () {
        oType.parseValue("1 234.567.890", "string");
    }, "multiple decimal points");
    assert.strictEqual(oType.parseValue(1234, "int"), "1234", "type int");
    assert.strictEqual(oType.parseValue(1234.567, "float"), "1234.567", "type float");
    assert.strictEqual(oType.parseValue(1.2345e+100, "float"), "123450000000000000000000000000" + "00000000000000000000000000000000000000000000000000000000000000000000000", "float with more that 99 digits");
    assert.strictEqual(oType.parseValue(-0.000012345, "float"), "-0.000012345", "small float");
    assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
    assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
    try {
        oType.parseValue(true, "boolean");
        assert.ok(false);
    }
    catch (e) {
        assert.ok(e instanceof ParseException);
        assert.strictEqual(e.message, "Don't know how to parse sap.ui.model.odata.type.Decimal from boolean");
    }
    this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").returns("string");
    assert.strictEqual(oType.parseValue("123,456.000", "sap.ui.core.CSSSize"), "123456");
});
QUnit.test("large numbers, modified Swedish", function (assert) {
    var oType = new Decimal({ plusSign: ">", minusSign: "<" }, { scale: "variable" }), oValue = "-1", oExpected = "<1";
    sap.ui.getCore().getConfiguration().setLanguage("sv");
    assert.strictEqual(oType.formatValue("1234567890123456.789012", "string"), "1\u00A0234\u00A0567\u00A0890\u00A0123\u00A0456,789012", "format w/ decimals");
    assert.strictEqual(oType.formatValue("-1234567890123456789012", "string"), "<1\u00A0234\u00A0567\u00A0890\u00A0123\u00A0456\u00A0789\u00A0012", "format w/ minus");
    while (oValue.length < 102) {
        oValue += "000";
        oExpected += "\u00A0000";
    }
    assert.strictEqual(oType.formatValue(oValue, "string"), oExpected, "format >99 integer digits");
    assert.strictEqual(oType.parseValue(">1 234 567 890 123 456,789012", "string"), "1234567890123456.789012", "plus sign, spaces");
    assert.strictEqual(oType.parseValue("<1 234\u00A0567 890\t123 456 789\u00A0012", "string"), "-1234567890123456789012", "minus sign, tab, non-breaking spaces");
    assert.strictEqual(oType.parseValue(" 1 234\u00A0567 890,123456789012", "string"), "1234567890.123456789012", "many decimals");
});
QUnit.test("parse large numbers w/ format options", function (assert) {
    var oFormatOptions = {
        plusSign: "+",
        minusSign: "-",
        minFractionDigits: 5,
        maxFractionDigits: 10,
        minIntegerDigits: 5,
        maxIntegerDigits: 10,
        decimals: 10,
        groupingEnabled: false,
        groupingSeparator: "'",
        decimalSeparator: "."
    }, oType;
    oType = new Decimal();
    assert.strictEqual(oType.parseValue("1 234 567 890 123 456.789012", "string"), "1234567890123456.789012", "no format options -> full precision");
    oType = new Decimal(oFormatOptions);
    assert.strictEqual(oType.parseValue("1 234 567 890 123 456.789012", "string"), "1234567890123456.789012", "only safe format options -> full precision");
    oFormatOptions.foo = "bar";
    oType = new Decimal(oFormatOptions);
    assert.strictEqual(oType.parseValue("123 456 789 012 345.6789012", "string"), "123456789012345.6789012", "random format option");
    oType = new Decimal({ style: "short" });
    assert.strictEqual(oType.parseValue("1K", "string"), "1000", "style: \"short\"");
    TestUtils.withNormalizedMessages(function () {
        try {
            oType.parseValue("no number", "string");
            assert.ok(false, "no error");
        }
        catch (e) {
            assert.ok(e instanceof ParseException);
            assert.strictEqual(e.message, "EnterNumber");
        }
    });
});
QUnit.test("parse: user error: not a number", function (assert) {
    TestUtils.withNormalizedMessages(function () {
        var oType = new Decimal({}, { scale: 3 });
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
[
    { value: false, error: "EnterNumber" },
    { value: 42, error: "EnterNumber" },
    { value: "a", error: "EnterNumber" },
    { value: "1.234E-32", error: "EnterNumber" },
    { value: "1.23", constraints: { precision: 2, scale: 1 }, error: "EnterNumberFraction 1" },
    { value: "12.3", constraints: { precision: 3, scale: 2 }, error: "EnterNumberInteger 1" },
    { value: "12", constraints: { precision: 1 }, error: "EnterMaximumOfDigits 1" },
    { value: "12.34", constraints: { precision: 3, scale: "variable" }, error: "EnterNumberPrecision 3" },
    { value: "1.2", error: "EnterInt" },
    { value: "123.45", constraints: { precision: 3, scale: 1 }, error: "EnterNumberIntegerFraction 2 1" },
    { value: "1.0", error: "EnterInt" },
    { value: "012", constraints: { precision: 2 }, error: "EnterMaximumOfDigits 2" },
    { value: "99", constraints: { minimum: "100" }, error: "EnterNumberMin 100" },
    { value: "99.999", constraints: { precision: 6, scale: 3, minimum: "100" }, error: "EnterNumberMin 100.000" },
    { value: "-100", constraints: { minimum: "100" }, error: "EnterNumberMin 100" },
    { value: "100", constraints: { minimum: "100", minimumExclusive: true }, error: "EnterNumberMinExclusive 100" },
    { value: "1001", constraints: { maximum: "1000" }, error: "EnterNumberMax 1,000" },
    { value: "1000.001", constraints: { precision: 7, scale: 3, maximum: "1000" }, error: "EnterNumberMax 1,000.000" },
    { value: "1000", constraints: { maximum: "1000", maximumExclusive: true }, error: "EnterNumberMaxExclusive 1,000" },
    { value: "0.1234", constraints: { precision: 3, scale: 3 }, error: "EnterNumberFraction 3" },
    { value: "1.1234", constraints: { precision: 3, scale: 3 }, error: "EnterNumberFractionOnly 3" },
    { value: "1.123", constraints: { precision: 4, scale: 4 }, error: "EnterNumberFractionOnly 4" },
    { value: "-1", constraints: { precision: 2, scale: 2 }, error: "EnterNumberFractionOnly 2" },
    { value: "10.2", constraints: { precision: 4, scale: 4 }, error: "EnterNumberFractionOnly 4" }
].forEach(function (oFixture) {
    QUnit.test("validate : " + oFixture.value, function (assert) {
        TestUtils.withNormalizedMessages(function () {
            var oType = new Decimal({}, oFixture.constraints);
            try {
                oType.validateValue(oFixture.value);
                assert.ok(false);
            }
            catch (e) {
                assert.ok(e instanceof ValidateException);
                assert.strictEqual(e.message, oFixture.error);
            }
        });
    });
});
QUnit.test("validate success", function (assert) {
    var oType = new Decimal({}, { precision: 6, scale: 3 });
    ["+1.1", "+123.123", "-123.1", "+123.1", "1.123", "-1.123", "123.1", "1", "-123"].forEach(function (sValue) {
        oType.validateValue(sValue);
    });
});
QUnit.test("validate success  for minimum and maximum without exclusive", function (assert) {
    var oType = new Decimal({}, { precision: 7, scale: 3, minimum: "100", maximum: "1000" });
    ["100", "1000", "+100.1"].forEach(function (sValue) {
        oType.validateValue(sValue);
    });
});
["+0.1", "+0.123", "-0.1", "-0.123", "0"].forEach(function (sValue) {
    QUnit.test("validate success equal precision and scale: " + sValue, function (assert) {
        var oType = new Decimal({}, { precision: 3, scale: 3 });
        oType.validateValue(sValue);
    });
});
QUnit.test("localization change", function (assert) {
    var oControl = new Control(), oType = new Decimal();
    oControl.bindProperty("tooltip", { path: "/unused", type: oType });
    sap.ui.getCore().getConfiguration().setLanguage("de-CH");
    assert.strictEqual(oType.formatValue("1234", "string"), "1\u2019234", "adjusted to changed language");
});
QUnit.test("scale=\"variable\"", function (assert) {
    var oType;
    oType = new Decimal({}, { precision: 3, scale: "variable" });
    ["123", "12.3", "-1.23"].forEach(function (sValue) {
        assert.strictEqual(oType.formatValue(sValue, "string"), sValue);
        oType.validateValue(sValue);
    });
});
QUnit.test("validate : nullable", function (assert) {
    var oType = new Decimal();
    oType.validateValue(null);
    TestUtils.withNormalizedMessages(function () {
        oType = new Decimal({}, { nullable: false, scale: "variable" });
        try {
            oType.validateValue(null);
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof ValidateException);
            assert.strictEqual(e.message, "EnterNumber");
        }
    });
});
QUnit.test("setConstraints w/ strings", function (assert) {
    var oType;
    oType = new Decimal({}, { maximum: "1000", maximumExclusive: "true", minimum: "100", minimumExclusive: true, nullable: "false", precision: "10", scale: "3" });
    assert.deepEqual(oType.oConstraints, { maximum: "1000", maximumExclusive: true, minimum: "100", minimumExclusive: true, nullable: false, precision: 10, scale: 3 });
    oType = new Decimal({}, { nullable: "true" });
    assert.strictEqual(oType.oConstraints, undefined);
});
[{
        set: undefined,
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: true }
    }, {
        set: {},
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: true }
    }, {
        set: { preserveDecimals: true },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: true }
    }, {
        set: { preserveDecimals: "yes" },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: "yes" }
    }, {
        set: { preserveDecimals: undefined },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: undefined }
    }, {
        set: { preserveDecimals: null },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: null }
    }, {
        set: { preserveDecimals: false },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: false }
    }, {
        set: { style: "short" },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, style: "short" }
    }, {
        set: { style: "long" },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, style: "long" }
    }, {
        set: { style: "standard" },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: true, style: "standard" }
    }, {
        set: { preserveDecimals: true, style: "short" },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: true, style: "short" }
    }, {
        set: { preserveDecimals: true, style: "long" },
        expect: { groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: true, style: "long" }
    }, {
        set: { foo: "bar" },
        expect: { foo: "bar", groupingEnabled: true, maxIntegerDigits: Infinity, parseAsString: true, preserveDecimals: true }
    }, {
        set: { decimalSeparator: ".", maxIntegerDigits: 20 },
        scale: 13,
        expect: { decimalSeparator: ".", groupingEnabled: true, maxFractionDigits: 13, maxIntegerDigits: 20, minFractionDigits: 13, parseAsString: true, preserveDecimals: true }
    }, {
        set: { groupingEnabled: false },
        scale: 13,
        expect: { groupingEnabled: false, maxFractionDigits: 13, maxIntegerDigits: Infinity, minFractionDigits: 13, parseAsString: true, preserveDecimals: true }
    }, {
        set: { decimals: 20 },
        scale: 13,
        expect: { decimals: 20, groupingEnabled: true, maxFractionDigits: 13, maxIntegerDigits: Infinity, minFractionDigits: 13, parseAsString: true, preserveDecimals: true }
    }, {
        set: { maxFractionDigits: 20 },
        scale: 13,
        expect: { groupingEnabled: true, maxFractionDigits: 20, maxIntegerDigits: Infinity, minFractionDigits: 13, parseAsString: true, preserveDecimals: true }
    }, {
        set: { minFractionDigits: 10 },
        scale: 13,
        expect: { groupingEnabled: true, maxFractionDigits: 13, maxIntegerDigits: Infinity, minFractionDigits: 10, parseAsString: true, preserveDecimals: true }
    }].forEach(function (oFixture) {
    QUnit.test("formatOptions: " + JSON.stringify(oFixture.set), function (assert) {
        var oSpy, oType = new Decimal(oFixture.set, {
            scale: oFixture.scale || "variable"
        });
        assert.deepEqual(oType.oFormatOptions, oFixture.set);
        oSpy = this.spy(NumberFormat, "getFloatInstance");
        oType.formatValue("42", "string");
        sinon.assert.calledWithExactly(oSpy, oFixture.expect);
    });
});