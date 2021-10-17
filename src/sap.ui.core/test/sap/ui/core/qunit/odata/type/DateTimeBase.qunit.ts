import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import CalendarType from "sap/ui/core/CalendarType";
import Control from "sap/ui/core/Control";
import DateFormat from "sap/ui/core/format/DateFormat";
import FormatException from "sap/ui/model/FormatException";
import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
import JSONModel from "sap/ui/model/json/JSONModel";
import DateTime from "sap/ui/model/odata/type/DateTime";
import DateTimeBase from "sap/ui/model/odata/type/DateTimeBase";
import DateTimeOffset from "sap/ui/model/odata/type/DateTimeOffset";
import ODataType from "sap/ui/model/odata/type/ODataType";
import TestUtils from "sap/ui/test/TestUtils";
var oDateOnly = new Date(Date.UTC(2014, 10, 27, 0, 0, 0, 0)), oDateTime = new Date(2014, 10, 27, 13, 47, 26), sDateTimeOffset = "2014-11-27T13:47:26" + getTimezoneOffset(oDateTime), sDateTimeOffsetWithMS = "2014-11-27T13:47:26.456" + getTimezoneOffset(oDateTime), sDateTimeOffsetYear0 = "0000-11-27T13:47:26" + getTimezoneOffset(oDateTime), oDateTimeUTC = new Date(Date.UTC(2014, 10, 27, 13, 47, 26)), oDateTimeWithMS = new Date(2014, 10, 27, 13, 47, 26, 456), sFormattedDateOnly = "Nov 27, 2014", sFormattedDateTime = "Nov 27, 2014, 1:47:26 PM", iFullYear = new Date().getFullYear(), oMessages = {
    "EnterDateTime": "EnterDateTime Dec 31, " + iFullYear + ", 11:59:58 PM",
    "EnterDate": "EnterDate Dec 31, " + iFullYear
};
function createInstance(sTypeName, oFormatOptions, oConstraints) {
    return new (ObjectPath.get(sTypeName))(oFormatOptions, oConstraints);
}
function getTimezoneOffset(oDate) {
    var iTimezoneOffset = oDate.getTimezoneOffset(), iMinutes = Math.abs(iTimezoneOffset) % 60, iHours = (Math.abs(iTimezoneOffset) - iMinutes) / 60, sTimezoneOffset = iTimezoneOffset < 0 ? "+" : "-";
    if (iTimezoneOffset === 0) {
        return "Z";
    }
    if (iHours < 10) {
        sTimezoneOffset += "0";
    }
    sTimezoneOffset += iHours;
    sTimezoneOffset += ":";
    if (iMinutes < 10) {
        sTimezoneOffset += "0";
    }
    sTimezoneOffset += iMinutes;
    return sTimezoneOffset;
}
function module(sTitle) {
    QUnit.module(sTitle, {
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
}
function parseError(assert, oType, oValue, sExpectedErrorKey, sReason) {
    TestUtils.withNormalizedMessages(function () {
        try {
            oType.parseValue(oValue, "string");
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof ParseException, sReason + ": exception");
            assert.strictEqual(e.message, oMessages[sExpectedErrorKey], sReason + ": message");
        }
    });
}
function validateError(assert, oType, oValue, sExpectedErrorKey, sReason) {
    TestUtils.withNormalizedMessages(function () {
        try {
            oType.validateValue(oValue);
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof ValidateException, sReason + ": exception");
            assert.strictEqual(e.message, oMessages[sExpectedErrorKey], sReason + ": message");
        }
    });
}
function validate(assert, sTypeName, oConstraints, sExpectedErrorKey) {
    var oDate = new Date(), oType = createInstance(sTypeName, undefined, oConstraints);
    oType.validateValue(null);
    oConstraints.nullable = false;
    oType = createInstance(sTypeName, undefined, oConstraints);
    validateError(assert, oType, null, sExpectedErrorKey, "nullable");
    [undefined, false, 0, 1, "foo"].forEach(function (vValue) {
        try {
            oType.validateValue(vValue);
            assert.ok(false);
        }
        catch (e) {
            assert.ok(e instanceof ValidateException);
            assert.strictEqual(e.message, "Illegal " + sTypeName + " value: " + vValue, vValue);
        }
    });
    oDate.setFullYear(0);
    validateError(assert, oType, oDate, sExpectedErrorKey, "year 0");
    oType.validateValue(new Date());
}
function formatParseValidate(assert, sTypeName, oConstraints, oTestDate) {
    var oType = createInstance(sTypeName, undefined, oConstraints), sFormattedDate = oType.formatValue(oTestDate, "string"), oResultingDate = oType.parseValue(sFormattedDate, "string");
    oType.validateValue(oResultingDate);
    assert.deepEqual(oResultingDate, oTestDate, "format and parse did not change the date");
}
function dateTime(sTypeName) {
    QUnit.test("basics", function (assert) {
        var oType = createInstance(sTypeName);
        assert.ok(oType instanceof DateTimeBase, "is a DateTime");
        assert.ok(oType instanceof ODataType, "is an ODataType");
        assert.strictEqual(oType.getName(), sTypeName, "type name");
        assert.strictEqual(oType.oFormatOptions, undefined, "format options ignored");
        assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
        assert.strictEqual(oType.oConstraints, undefined, "default constraints");
        assert.strictEqual(oType.oFormat, null, "no formatter preload");
        createInstance(sTypeName, null, null);
    });
    QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints", function (assert) {
        var oType = createInstance(sTypeName, null, null);
        assert.deepEqual(oType.oFormatOptions, null, "no format options");
        assert.deepEqual(oType.oConstraints, undefined, "default constraints");
    });
    QUnit.test("formatValue", function (assert) {
        var oType = createInstance(sTypeName);
        assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
        assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
        assert.strictEqual(oType.formatValue(oDateTime, "any"), oDateTime, "target type any");
        assert.strictEqual(oType.formatValue(oDateTime, "string"), sFormattedDateTime, "target type string");
        ["int", "float", "boolean"].forEach(function (sType) {
            try {
                oType.formatValue(oDateTime, sType);
                assert.ok(false);
            }
            catch (e) {
                assert.ok(e instanceof FormatException);
                assert.strictEqual(e.message, "Don't know how to format " + sTypeName + " to " + sType);
            }
        });
        this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").atLeast(1).returns("string");
        assert.strictEqual(oType.formatValue(oDateTime, "sap.ui.core.CSSSize"), sFormattedDateTime);
        oType = createInstance(sTypeName, {}, { precision: 3 });
        assert.strictEqual(oType.formatValue(oDateTimeWithMS, "string"), sFormattedDateTime, "format with precision");
    });
    QUnit.test("parseValue", function (assert) {
        var oType = createInstance(sTypeName);
        assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
        assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
        assert.deepEqual(oType.parseValue(sFormattedDateTime, "string"), oDateTime);
        ["int", "float", "boolean"].forEach(function (sType) {
            try {
                oType.parseValue(sFormattedDateTime, sType);
                assert.ok(false);
            }
            catch (e) {
                assert.ok(e instanceof ParseException, sType + ": exception");
                assert.strictEqual(e.message, "Don't know how to parse " + sTypeName + " from " + sType, sType + ": message");
            }
        });
        parseError(assert, oType, "foo", "EnterDateTime", "not a date");
        parseError(assert, oType, "Feb 28, 2014, 11:69:30 AM", "EnterDateTime", "invalid time");
        this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize").returns("string");
        assert.deepEqual(oType.parseValue(sFormattedDateTime, "sap.ui.core.CSSSize"), oDateTime);
        oType = createInstance(sTypeName, {}, { precision: 3 });
    });
    QUnit.test("validateValue", function (assert) {
        validate(assert, sTypeName, {}, "EnterDateTime");
    });
    QUnit.test("format, parse, validate", function (assert) {
        formatParseValidate(assert, sTypeName, undefined, oDateTime);
    });
    QUnit.test("localization change", function (assert) {
        var oControl = new Control(), oType = createInstance(sTypeName);
        oControl.bindProperty("tooltip", { path: "/unused", type: oType });
        sap.ui.getCore().getConfiguration().setLanguage("de-DE");
        assert.strictEqual(oType.formatValue(oDateTime, "string"), DateFormat.getDateTimeInstance().format(oDateTime), "adjusted to changed language");
    });
    QUnit.test("format option UTC", function (assert) {
        var oType = createInstance(sTypeName, { UTC: true }), oDateTime = new Date(Date.UTC(2014, 10, 27, 13, 47, 26)), sFormattedDateTime = "Nov 27, 2014, 1:47:26 PM";
        assert.strictEqual(oType.formatValue(oDateTime, "string"), sFormattedDateTime);
        assert.deepEqual(oType.parseValue(sFormattedDateTime, "string"), oDateTime);
    });
    QUnit.test("getModelFormat", function (assert) {
        var oType = createInstance(sTypeName), oFormat = oType.getModelFormat();
        assert.equal(oFormat.format(oDateTime), oDateTime, "format");
        assert.equal(oFormat.parse(sFormattedDateTime), sFormattedDateTime, "parse");
    });
    QUnit.test("format: bad input type", function (assert) {
        var oBadModelValue = "foo", oType = createInstance(sTypeName);
        assert.throws(function () {
            oType.formatValue(oBadModelValue, "string");
        }, new FormatException("Illegal " + oType.getName() + " value: " + oBadModelValue));
        assert.strictEqual(oType.formatValue(oBadModelValue, "any"), oBadModelValue);
    });
}
QUnit.test("DateTimeBase constraints undefined", function (assert) {
    var oType = new DateTimeBase({}, undefined);
    assert.deepEqual(oType.oConstraints, undefined);
});
module("sap.ui.model.odata.type.DateTime");
dateTime("sap.ui.model.odata.type.DateTime");
[
    { i: {}, o: undefined },
    { i: { nullable: true, displayFormat: "Date" }, o: { isDateOnly: true } },
    { i: { nullable: false, displayFormat: "foo" }, o: { nullable: false }, warning: "Illegal displayFormat: foo" },
    { i: { nullable: "true", displayFormat: 1 }, o: undefined, warning: "Illegal displayFormat: 1" },
    { i: { nullable: "false" }, o: { nullable: false } },
    { i: { nullable: "foo" }, o: undefined, warning: "Illegal nullable: foo" }
].forEach(function (oFixture) {
    QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
        var oType;
        if (oFixture.warning) {
            this.oLogMock.expects("warning").withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.DateTime");
        }
        oType = new DateTime({}, oFixture.i);
        assert.deepEqual(oType.oConstraints, oFixture.o);
    });
});
QUnit.test("getConstraints", function (assert) {
    var oType = new DateTime(undefined, {});
    assert.deepEqual(oType.getConstraints(), {});
    oType = new DateTime(undefined, { displayFormat: "Date" });
    assert.deepEqual(oType.getConstraints(), { displayFormat: "Date" });
});
[
    { oFormatOptions: {}, oExpected: { strictParsing: true } },
    { oFormatOptions: undefined, oExpected: { strictParsing: true } },
    { oFormatOptions: { strictParsing: false, UTC: true }, oExpected: { strictParsing: false, UTC: true } },
    { oFormatOptions: { foo: "bar" }, oExpected: { strictParsing: true, foo: "bar" } },
    { oFormatOptions: { style: "medium" }, oExpected: { strictParsing: true, style: "medium" } },
    { oFormatOptions: {}, oConstraints: { displayFormat: "Date" }, oExpected: { UTC: true, strictParsing: true } },
    { oFormatOptions: undefined, oConstraints: { displayFormat: "Date" }, oExpected: { UTC: true, strictParsing: true } },
    { oFormatOptions: { strictParsing: false }, oConstraints: { displayFormat: "Date" }, oExpected: { UTC: true, strictParsing: false } },
    { oFormatOptions: { foo: "bar" }, oConstraints: { displayFormat: "Date" }, oExpected: { UTC: true, strictParsing: true, foo: "bar" } },
    { oFormatOptions: { UTC: false }, oConstraints: { displayFormat: "Date" }, oExpected: { UTC: true, strictParsing: true } },
    { oFormatOptions: { style: "medium" }, oConstraints: { displayFormat: "Date" }, oExpected: { UTC: true, strictParsing: true, style: "medium" } }
].forEach(function (oFixture) {
    QUnit.test("formatOptions=" + JSON.stringify(oFixture.oFormatOptions), function (assert) {
        var oType = new DateTime(oFixture.oFormatOptions, oFixture.oConstraints), oSpy = (oFixture.oConstraints) ? this.spy(DateFormat, "getDateInstance") : this.spy(DateFormat, "getDateTimeInstance");
        assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions, "format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
        oType.formatValue(oDateTime, "string");
        assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
    });
});
QUnit.test("format and parse (Date only)", function (assert) {
    var oType = new DateTime({}, { displayFormat: "Date" });
    assert.strictEqual(oType.formatValue(oDateOnly, "string"), sFormattedDateOnly, "target type string");
    assert.deepEqual(oType.parseValue(sFormattedDateOnly, "string"), oDateOnly);
    parseError(assert, oType, "Feb 30, 2014", "EnterDate", "invalid date");
});
QUnit.test("validate (Date only)", function (assert) {
    validate(assert, "sap.ui.model.odata.type.DateTime", { displayFormat: "Date" }, "EnterDate");
});
QUnit.test("format, parse, validate (Date only)", function (assert) {
    formatParseValidate(assert, "sap.ui.model.odata.type.DateTime", { displayFormat: "Date" }, oDateOnly);
});
module("sap.ui.model.odata.type.DateTimeOffset");
dateTime("sap.ui.model.odata.type.DateTimeOffset");
[
    { i: { "foo": "bar" }, o: undefined },
    { i: {}, o: undefined },
    { i: { nullable: true, displayFormat: "Date" }, o: undefined },
    { i: { nullable: false, isDateOnly: true }, o: { nullable: false } },
    { i: { nullable: "true" }, o: undefined },
    { i: { nullable: "false" }, o: { nullable: false } },
    { i: { nullable: "foo" }, o: undefined, warning: "Illegal nullable: foo" },
    { i: { precision: undefined }, o: undefined },
    { i: { precision: -0 }, o: undefined },
    { i: { precision: 0 }, o: undefined },
    { i: { precision: 1 }, o: { precision: 1 } },
    { i: { precision: 3 }, o: { precision: 3 } },
    { i: { precision: 12 }, o: { precision: 12 } },
    { i: { precision: "" }, o: undefined, warning: "Illegal precision: " },
    { i: { precision: "foo" }, o: undefined, warning: "Illegal precision: foo" },
    { i: { precision: -1 }, o: undefined, warning: "Illegal precision: -1" },
    { i: { precision: 0.9 }, o: undefined, warning: "Illegal precision: 0.9" },
    { i: { precision: 3.14 }, o: undefined, warning: "Illegal precision: 3.14" },
    { i: { precision: 12.1 }, o: undefined, warning: "Illegal precision: 12.1" },
    { i: { nullable: "false", precision: 3 }, o: { nullable: false, precision: 3 } },
    { i: { V4: undefined }, o: undefined },
    { i: { V4: false }, o: undefined },
    { i: { V4: true }, o: undefined },
    { i: { V4: 0 }, o: undefined, warning: "Illegal V4: 0" }
].forEach(function (oFixture) {
    QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
        var oType;
        if (oFixture.warning) {
            this.oLogMock.expects("warning").withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.DateTimeOffset");
        }
        oType = new DateTimeOffset({}, oFixture.i);
        assert.deepEqual(oType.oConstraints, oFixture.o);
        assert.deepEqual(oType.bV4, !!oFixture.i.V4);
    });
});
[false, true].forEach(function (bV4) {
    QUnit.test("getConstraints: {V4 : " + bV4 + "}", function (assert) {
        var oType = new DateTimeOffset(undefined, { V4: bV4 });
        assert.deepEqual(oType.getConstraints(), bV4 ? { V4: bV4 } : {});
    });
});
[
    { oFormatOptions: {}, oExpected: { strictParsing: true } },
    { oFormatOptions: undefined, oExpected: { strictParsing: true } },
    { oFormatOptions: { strictParsing: false }, oExpected: { strictParsing: false } },
    { oFormatOptions: { foo: "bar" }, oExpected: { strictParsing: true, foo: "bar" } },
    { oFormatOptions: { style: "medium" }, oExpected: { strictParsing: true, style: "medium" } }
].forEach(function (oFixture) {
    QUnit.test("formatOptions=" + JSON.stringify(oFixture.oFormatOptions), function (assert) {
        var oType = new DateTimeOffset(oFixture.oFormatOptions, {}), oSpy = this.spy(DateFormat, "getDateTimeInstance");
        assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions, "format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
        oType.formatValue(oDateTime, "string");
        assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
    });
});
QUnit.test("setV4", function (assert) {
    var oDateTimeOffsetV4 = new DateTimeOffset(undefined, { precision: 7 }).setV4(), sDateTimeOffsetFromObjectSource = oDateTimeOffsetV4.parseValue(oDateTime, "object"), sDateTimeOffsetParsed = oDateTimeOffsetV4.parseValue(sFormattedDateTime, "string"), sDateTimeOffsetWithPrecision = "2014-11-27T13:47:26.0000000" + getTimezoneOffset(oDateTime), oDateTimeOffsetV2 = new DateTimeOffset(), oDateTimeOffsetAsDate = oDateTimeOffsetV2.parseValue(sFormattedDateTime, "string");
    assert.strictEqual(typeof sDateTimeOffset, "string");
    assert.strictEqual(sDateTimeOffsetParsed, sDateTimeOffsetWithPrecision);
    assert.strictEqual(sDateTimeOffsetFromObjectSource, sDateTimeOffsetWithPrecision);
    assert.ok(oDateTimeOffsetAsDate instanceof Date);
    assert.throws(function () {
        oDateTimeOffsetV4.validateValue(oDateTimeOffsetAsDate);
    }, new ValidateException("Illegal sap.ui.model.odata.type.DateTimeOffset value: " + oDateTimeOffsetAsDate));
    assert.throws(function () {
        oDateTimeOffsetV2.validateValue(sDateTimeOffset);
    }, new ValidateException("Illegal sap.ui.model.odata.type.DateTimeOffset value: " + sDateTimeOffset));
});
QUnit.test("V4 : true", function (assert) {
    var oDateTimeOffsetV4 = new DateTimeOffset(undefined, { V4: true }), oModel = new JSONModel({
        DateTimeOffset: sDateTimeOffset
    }), oControl = new Control({
        models: oModel,
        tooltip: "{constraints : {V4 : true}, path : '/DateTimeOffset'" + ", type : 'sap.ui.model.odata.type.DateTimeOffset'}"
    });
    assert.strictEqual(oControl.getTooltip(), sFormattedDateTime);
    oDateTimeOffsetV4.validateValue(sDateTimeOffset);
    oDateTimeOffsetV4.validateValue(sDateTimeOffsetYear0);
    oControl.getBinding("tooltip").getType().validateValue(sDateTimeOffset);
});
QUnit.test("V4: formatValue", function (assert) {
    var oDateTimeOffset = new DateTimeOffset();
    assert.deepEqual(oDateTimeOffset.formatValue(oDateTimeUTC, "object"), oDateTime, "JS date-object can be formatted");
    assert.deepEqual(oDateTimeOffset.formatValue("foo", "object"), null);
    assert.deepEqual(oDateTimeOffset.formatValue(undefined, "object"), null);
    assert.deepEqual(oDateTimeOffset.formatValue(null, "object"), null);
    assert.deepEqual(oDateTimeOffset.formatValue("", "object"), null);
    assert.strictEqual(oDateTimeOffset.formatValue(sDateTimeOffset, "string"), sFormattedDateTime, "V4 values can be formatted");
    assert.strictEqual(oDateTimeOffset.formatValue("2014-11-27T12:47:26Z", "any"), "2014-11-27T12:47:26Z", "V4 values parsed only when needed");
    assert.throws(function () {
        oDateTimeOffset.formatValue("2000-02-30T00:00:00Z", "string");
    }, new FormatException("Illegal sap.ui.model.odata.type.DateTimeOffset value: 2000-02-30T00:00:00Z"));
    this.mock(oDateTimeOffset).expects("getPrimitiveType").thrice().withExactArgs("sap.ui.core.CSSSize").returns("string");
    assert.strictEqual(oDateTimeOffset.formatValue(sDateTimeOffset, "sap.ui.core.CSSSize"), sFormattedDateTime);
    oDateTimeOffset = new DateTimeOffset({}, { precision: 3 });
    assert.strictEqual(oDateTimeOffset.formatValue(sDateTimeOffsetWithMS, "string"), sFormattedDateTime, "V4 value with milliseconds accepted");
});
QUnit.test("V4: validateValue", function (assert) {
    var oDateTimeOffset0 = new DateTimeOffset().setV4(), oDateTimeOffset12 = new DateTimeOffset(undefined, { precision: 12 }).setV4();
    function throws(oDateTimeOffset, sValue) {
        assert.throws(function () {
            oDateTimeOffset.validateValue(sValue);
        }, new ValidateException("Illegal sap.ui.model.odata.type.DateTimeOffset value: " + sValue));
    }
    oDateTimeOffset0.validateValue("2000-01-01T16:00:00Z");
    throws(oDateTimeOffset0, "2000-01-01T16:00:00.0Z");
    throws(oDateTimeOffset0, undefined);
    [
        "2000-01-01T16:00Z",
        "2000-01-01t16:00:00z",
        "2000-01-01T16:00:00.0Z",
        "2000-01-01T16:00:00.000Z",
        "2000-01-02T01:00:00.000+09:00",
        "2000-01-02T06:00:00.000+14:00",
        "2000-01-01T16:00:00.000456789012Z"
    ].forEach(function (sValue) {
        oDateTimeOffset12.validateValue(sValue);
    });
    [
        "2000-01-01",
        "2000-01-01T16:00GMT",
        "2000-01-32T16:00:00.000Z",
        "2000-01-01T16:00:00.1234567890123Z",
        "2000-01-01T16:00:00.000+14:01",
        "2000-01-01T16:00:00.000+00:60",
        "2000-01-01T16:00:00.000~00:00",
        "2000-01-01T16:00:00.Z",
        "-0006-12-24T00:00:00Z",
        "-6-12-24T16:00:00Z"
    ].forEach(function (sValue) {
        throws(oDateTimeOffset12, sValue);
    });
});
QUnit.test("V4: format option UTC", function (assert) {
    var oType = new DateTimeOffset({ UTC: true }, { V4: true }), sDateTime = "2014-11-27T13:47:26Z", sFormattedDateTime = "Nov 27, 2014, 1:47:26 PM", oFormattedDateTime = new Date(Date.UTC(2014, 10, 27, 13, 47, 26));
    oType._resetModelFormatter();
    this.mock(DateFormat).expects("getDateInstance").withExactArgs({
        calendarType: CalendarType.Gregorian,
        pattern: "yyyy-MM-dd'T'HH:mm:ssXXX",
        strictParsing: true,
        UTC: oType.oFormatOptions && oType.oFormatOptions.UTC
    }).callThrough();
    assert.strictEqual(oType.formatValue(sDateTime, "string"), sFormattedDateTime);
    assert.strictEqual(oType.parseValue(sFormattedDateTime, "string"), sDateTime);
    assert.deepEqual(oType.formatValue(sDateTime, "object"), oFormattedDateTime);
    assert.deepEqual(oType.parseValue(oFormattedDateTime, "object"), sDateTime);
});
QUnit.test("V4: getModelFormat uses Gregorian calendar type", function (assert) {
    var oFormat, oParsedDate, oType = new DateTimeOffset(undefined, { precision: 3 }).setV4();
    sap.ui.getCore().getConfiguration().setCalendarType(CalendarType.Japanese);
    oType._resetModelFormatter();
    oFormat = oType.getModelFormat();
    oParsedDate = oFormat.parse(sDateTimeOffsetWithMS);
    assert.ok(oParsedDate instanceof Date, "parse delivers a Date");
    assert.strictEqual(oParsedDate.getTime(), oDateTimeWithMS.getTime(), "parse value");
    assert.strictEqual(oFormat.format(oParsedDate), sDateTimeOffsetWithMS, "format");
    assert.strictEqual(oFormat.oFormatOptions.calendarType, CalendarType.Gregorian);
});
QUnit.test("_resetModelFormatter", function (assert) {
    var oType = new DateTimeOffset().setV4(), oFormat = oType.getModelFormat();
    assert.strictEqual(oFormat, oType.getModelFormat());
    oType._resetModelFormatter();
    assert.notStrictEqual(oFormat, oType.getModelFormat());
});