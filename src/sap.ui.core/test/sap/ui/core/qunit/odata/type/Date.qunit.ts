import Log from "sap/base/Log";
import CalendarType from "sap/ui/core/CalendarType";
import Control from "sap/ui/core/Control";
import DateFormat from "sap/ui/core/format/DateFormat";
import FormatException from "sap/ui/model/FormatException";
import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
import DateType from "sap/ui/model/odata/type/Date";
import ODataType from "sap/ui/model/odata/type/ODataType";
import TestUtils from "sap/ui/test/TestUtils";
function checkError(assert, oType, oValue, sReason, sAction) {
    var fnExpectedException;
    TestUtils.withNormalizedMessages(function () {
        try {
            if (sAction === "parseValue") {
                fnExpectedException = ParseException;
                oType[sAction](oValue, "string");
            }
            else if (sAction === "validateValue") {
                fnExpectedException = ValidateException;
                oType[sAction](oValue);
            }
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof fnExpectedException, sReason + ": exception");
            assert.strictEqual(e.message, "EnterDate Dec 31, " + new Date().getFullYear(), sReason + ": message");
        }
    });
}
QUnit.module("sap.ui.model.odata.type.Date", {
    beforeEach: function () {
        var oConfiguration = sap.ui.getCore().getConfiguration();
        this.sDefaultCalendarType = oConfiguration.getCalendarType();
        this.sDefaultLanguage = oConfiguration.getLanguage();
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        oConfiguration.setCalendarType(CalendarType.Gregorian);
        oConfiguration.setLanguage("en-US");
    },
    afterEach: function () {
        var oConfiguration = sap.ui.getCore().getConfiguration();
        oConfiguration.setCalendarType(this.sDefaultCalendarType);
        oConfiguration.setLanguage(this.sDefaultLanguage);
    }
});
QUnit.test("basics", function (assert) {
    var oType = new DateType();
    assert.ok(oType instanceof DateType, "is a Date");
    assert.ok(oType instanceof ODataType, "is a ODataType");
    assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Date", "type name");
    assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
    assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
    assert.deepEqual(oType.oConstraints, undefined, "default constraints");
});
QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints", function (assert) {
    var oType = new DateType(null, null);
    assert.deepEqual(oType.oFormatOptions, null, "no format options");
    assert.deepEqual(oType.oConstraints, undefined, "default constraints");
});
["false", false, "true", true, undefined].forEach(function (vNullable, i) {
    QUnit.test("with nullable=" + vNullable + " (type: " + typeof vNullable + ")", function (assert) {
        var oType;
        oType = new DateType({}, {
            foo: "a",
            nullable: vNullable
        });
        assert.deepEqual(oType.oConstraints, i >= 2 ? undefined : { nullable: false });
    });
});
QUnit.test("default nullable is true", function (assert) {
    var oType;
    this.oLogMock.expects("warning").withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Date");
    oType = new DateType(null, { nullable: "foo" });
    assert.deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
});
[
    { i: undefined, o: null },
    { i: null, o: null },
    { i: "foo", t: "any", o: "foo" },
    { i: "2014-11-27", t: "string", o: "Nov 27, 2014" },
    { i: "2014-11-34", t: "string", o: "2014-11-34" },
    { i: new Date(Date.UTC(2014, 10, 27)), t: "string", o: "Nov 27, 2014" },
    { i: "2014-11-27", t: "object", o: new Date(2014, 10, 27) },
    { i: new Date(Date.UTC(2014, 10, 27)), t: "object", o: new Date(2014, 10, 27) }
].forEach(function (oFixture) {
    QUnit.test("format value", function (assert) {
        var oType = new DateType();
        assert.deepEqual(oType.formatValue(oFixture.i, oFixture.t), oFixture.o, oFixture.i);
    });
});
QUnit.test("format value, get primitive type", function (assert) {
    var oType = new DateType();
    this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").returns("string");
    assert.strictEqual(oType.formatValue("2014-11-27", "sap.ui.core.CSSSize"), "Nov 27, 2014");
});
QUnit.test("format value (error cases)", function (assert) {
    var oType = new DateType();
    ["int", "float", "boolean"].forEach(function (sType) {
        try {
            oType.formatValue("2015-12-24", sType);
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof FormatException);
            assert.strictEqual(e.message, "Don't know how to format sap.ui.model.odata.type.Date to " + sType);
        }
    });
});
[
    { oOptions: {}, oExpected: { strictParsing: true, UTC: true } },
    { oOptions: undefined, oExpected: { strictParsing: true, UTC: true } },
    { oOptions: { strictParsing: false }, oExpected: { strictParsing: false, UTC: true } },
    { oOptions: { foo: "bar" }, oExpected: { strictParsing: true, foo: "bar", UTC: true } },
    { oOptions: { style: "medium" }, oExpected: { strictParsing: true, style: "medium", UTC: true } },
    { oOptions: { strictParsing: false, UTC: false }, oExpected: { strictParsing: false, UTC: true } }
].forEach(function (oFixture) {
    QUnit.test("formatOptions=" + JSON.stringify(oFixture.oOptions), function (assert) {
        var oDateFormatMock = this.mock(DateFormat), oType = new DateType(oFixture.oOptions);
        assert.deepEqual(oType.oFormatOptions, oFixture.oOptions, "format options: " + JSON.stringify(oFixture.oOptions) + " set");
        DateType._resetModelFormatter();
        oDateFormatMock.expects("getDateInstance").withExactArgs({
            calendarType: CalendarType.Gregorian,
            pattern: "yyyy-MM-dd",
            strictParsing: true,
            UTC: true
        }).callThrough();
        oDateFormatMock.expects("getDateInstance").withExactArgs(oFixture.oExpected).callThrough();
        oType.formatValue("2015-12-24", "string");
        oType.formatValue("2015-12-25", "string");
    });
});
QUnit.test("parse value", function (assert) {
    var oType = new DateType();
    assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
    assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
    assert.deepEqual(oType.parseValue("Nov 1, 715", "string"), "0715-11-01", "valid date");
    assert.deepEqual(oType.parseValue(new Date(2014, 9, 27), "object"), "2014-10-27");
    ["int", "float", "boolean"].forEach(function (sType) {
        try {
            oType.parseValue("foo", sType);
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof ParseException, sType + ": exception");
            assert.strictEqual(e.message, "Don't know how to parse " + oType.getName() + " from " + sType, sType + ": message");
        }
    });
    checkError(assert, oType, "foo", "not a date", "parseValue");
    checkError(assert, oType, "Feb 29, 2015", "invalid date", "parseValue");
    this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").returns("string");
    assert.strictEqual(oType.parseValue("Nov 27, 2014", "sap.ui.core.CSSSize"), "2014-11-27");
});
QUnit.test("validate Date", function (assert) {
    var oConstraints = {}, oType = new DateType();
    oType.validateValue(null);
    oConstraints.nullable = false;
    oType = new DateType({}, oConstraints);
    checkError(assert, oType, null, "nullable: false", "validateValue");
    try {
        oType.validateValue("foo");
        assert.ok(false);
    }
    catch (e) {
        assert.ok(e instanceof ValidateException);
        assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: foo");
    }
    try {
        oType.validateValue(["0715-11-01"]);
        assert.ok(false);
    }
    catch (e) {
        assert.ok(e instanceof ValidateException);
        assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: 0715-11-01");
    }
    oType.validateValue("0715-11-01");
});
QUnit.test("format, parse, validate", function (assert) {
    var oType = new DateType({ pattern: "dd.MMM.yyyy" }), sFormattedDate = oType.formatValue("0715-11-01", "string"), sResultingDate = oType.parseValue(sFormattedDate, "string");
    oType.validateValue(sResultingDate);
    assert.deepEqual(sResultingDate, "0715-11-01", "format and parse did not change the date");
});
QUnit.test("format, parse, validate with target type object", function (assert) {
    var oType = new DateType({ pattern: "dd.MMM.yyyy" }), sFormattedDate = oType.formatValue("0715-11-01", "object"), sResultingDate = oType.parseValue(sFormattedDate, "object");
    oType.validateValue(sResultingDate);
    assert.deepEqual(sResultingDate, "0715-11-01", "format and parse did not change the date");
});
QUnit.test("getModelFormat() uses Gregorian calendar type", function (assert) {
    var oFormat, sModelValue = "2015-11-27", oParsedDate;
    sap.ui.getCore().getConfiguration().setCalendarType(CalendarType.Japanese);
    DateType._resetModelFormatter();
    oFormat = new DateType().getModelFormat();
    oParsedDate = oFormat.parse(sModelValue);
    assert.ok(oParsedDate instanceof Date, "parse delivers a Date");
    assert.strictEqual(oParsedDate.getTime(), Date.UTC(2015, 10, 27), "parse value");
    assert.strictEqual(oFormat.format(oParsedDate), sModelValue, "format");
    assert.strictEqual(oFormat.oFormatOptions.calendarType, CalendarType.Gregorian);
});
QUnit.test("localization change", function (assert) {
    var oControl = new Control(), oType = new DateType();
    oControl.bindProperty("tooltip", { path: "/unused", type: oType });
    assert.strictEqual(oType.formatValue("0715-11-01", "string"), "Nov 1, 715");
    sap.ui.getCore().getConfiguration().setLanguage("de-DE");
    assert.strictEqual(oType.formatValue("0715-11-01", "string"), "01.11.715", "adjusted to changed language");
});
QUnit.test("_resetModelFormatter", function (assert) {
    var oType = new DateType(), oFormat = oType.getModelFormat();
    assert.strictEqual(oFormat, oType.getModelFormat());
    DateType._resetModelFormatter();
    assert.notStrictEqual(oFormat, oType.getModelFormat());
});