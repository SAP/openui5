/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/_Helper",
	"sap/ui/model/CompositeType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/String",
	"sap/ui/test/TestUtils"
], function (Log, Localization, UI5Date, DateFormat, _Helper, CompositeType, FormatException,
		ParseException, DateTimeWithTimezone, DecimalType, StringType, TestUtils) {
	/*global sinon, QUnit*/
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.type.DateTimeWithTimezone",
		sDefaultLanguage = Localization.getLanguage(),
		sDefaultTimezone = Localization.getTimezone(),
		MyStringType = StringType.extend("MyString", {
			constructor : function () {
				StringType.apply(this, arguments);
			}
		});

	MyStringType.prototype.getName = function () {
		return "MyStringType";
	};

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.DateTimeWithTimezone", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			Localization.setLanguage("en-US");
			Localization.setTimezone("Europe/London");
		},
		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		// code under test
		var oType = new DateTimeWithTimezone();

		assert.ok(oType instanceof DateTimeWithTimezone, "is a DateTimeWithTimezone");
		assert.ok(oType instanceof CompositeType, "is a sap.ui.model.type.CompositeType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.DateTimeWithTimezone",
			"type name");
		assert.deepEqual(oType.oFormatOptions, {}, "format options");
		assert.deepEqual(oType.oConstraints, {}, "default constraints");
		assert.strictEqual(oType.oFormat, null);
		assert.strictEqual(oType.bParseWithValues, true);
		assert.strictEqual(oType.bUseInternalValues, true);
		assert.strictEqual(oType.vEmptyTimezoneValue, null);
		assert.strictEqual(oType.bShowDate, true);
		assert.strictEqual(oType.bShowTime, true);
		assert.strictEqual(oType.bShowTimezone, true);

		// cloning the type does not throw an error
		// code under test
		oType = new DateTimeWithTimezone(oType.getFormatOptions(), oType.getConstraints());

		assert.ok(oType instanceof DateTimeWithTimezone, "is a DateTimeWithTimezone");
	});

	//*********************************************************************************************
[true, false, "foo", null].forEach(function (vValue, i) {
	QUnit.test("constructor: new format options, #" + i, function (assert) {
		var oType;

		// code under test
		oType = new DateTimeWithTimezone({showDate : vValue});

		assert.strictEqual(oType.bShowDate, vValue);
		assert.strictEqual(oType.bShowTime, true);
		assert.strictEqual(oType.bShowTimezone, true);

		// code under test
		oType = new DateTimeWithTimezone({showTime : vValue});

		assert.strictEqual(oType.bShowDate, true);
		assert.strictEqual(oType.bShowTime, vValue);
		assert.strictEqual(oType.bShowTimezone, true);

		// code under test
		oType = new DateTimeWithTimezone({showTimezone : vValue});

		assert.strictEqual(oType.bShowDate, true);
		assert.strictEqual(oType.bShowTime, true);
		assert.strictEqual(oType.bShowTimezone, vValue);
	});
});

	//*********************************************************************************************
	QUnit.test("constructor: setFormatOptions/setConstraints called", function (assert) {
		var oConstraints = {},
			oFormatOptions = {foo : "bar"};

		this.mock(DateTimeWithTimezone.prototype).expects("setConstraints")
			.withExactArgs(sinon.match(function (oConstraints0) {
				assert.deepEqual(oConstraints0, {});

				return oConstraints0 !== oConstraints;
			}));
		this.mock(DateTimeWithTimezone.prototype).expects("setFormatOptions")
			.withExactArgs(sinon.match(function (oFormatOptions0) {
				assert.deepEqual(oFormatOptions0, oFormatOptions);

				return oFormatOptions0 !== oFormatOptions;
			}));

		// code under test
		assert.ok(new DateTimeWithTimezone(oFormatOptions, oConstraints));
	});

	//*********************************************************************************************
	QUnit.test("constructor: no constraints allowed", function (assert) {
		var oType;

		this.mock(DateTimeWithTimezone.prototype).expects("getName")
			.withExactArgs()
			.returns("~DateTimeWithTimezone");

		assert.throws(function () {
			// code under test
			oType = new DateTimeWithTimezone(null, {foo : 42});
		}, new Error("Type ~DateTimeWithTimezone does not support constraints"));

		assert.strictEqual(oType, undefined);
	});

	//*********************************************************************************************
	QUnit.test("constructor: format options are immutable", function (assert) {
		var oFormatOptions = {foo : "bar"},
			oType = new DateTimeWithTimezone(oFormatOptions);

		// code under test
		oFormatOptions.foo = "baz";

		assert.deepEqual(oType.getFormatOptions(), {foo : "bar"});

		assert.throws(function () {
			// code under test
			oType.setFormatOptions(oFormatOptions);
		}, new Error("Format options are immutable"));
	});

	//*********************************************************************************************
	QUnit.test("setConstraints: constraints are immutable", function (assert) {
		var oType = new DateTimeWithTimezone();

		assert.throws(function () {
			// code under test
			oType.setConstraints({});
		}, new Error("Constraints are immutable"));
	});

	//*********************************************************************************************
[
	undefined,
	null,
	[UI5Date.getInstance(), undefined],
	[undefined, "~timezone"]
].forEach(function (aValues, i) {
	var sTitle = "formatValue: no values, undefined timezone or timestamp lead to null, #" + i;

	QUnit.test(sTitle, function (assert) {
		var oType = new DateTimeWithTimezone();

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "string"), null);
	});
});

	//*********************************************************************************************
	QUnit.test("formatValue: no Date and showTimezone = false returns null", function (assert) {
		var oType = new DateTimeWithTimezone({showTimezone : false});

		// code under test
		assert.strictEqual(oType.formatValue([null, "~timezone"], "string"), null);
	});

	//*********************************************************************************************
["foo", 42, {}].forEach(function (oDate) {
	QUnit.test("formatValue: " + oDate + " is not a Date object", function (assert) {
		var oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getName").withExactArgs().returns("~DateTimeWithTimezone");

		// code under test
		assert.throws(function () {
			oType.formatValue([oDate, "~timezone"]);
		}, new FormatException("Timestamp value for ~DateTimeWithTimezone is not an instance of "
			+ "Date: " + oDate));
	});
});

	//*********************************************************************************************
[
	{showDate : true, showTime : true, showTimezone : true},
	{showDate : false, showTime : true, showTimezone : true},
	{showDate : true, showTime : false, showTimezone : true},
	{showDate : false, showTime : false, showTimezone : true}
].forEach(function (oFormatOptions) {
	var sTitle = "formatValue: no Date given, sTargetType = 'string', oFormatOptions = "
		+ JSON.stringify(oFormatOptions);

	QUnit.test(sTitle, function (assert) {
		var oFormat = {format : function () {}},
			oType = new DateTimeWithTimezone(oFormatOptions);

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~targetType").returns("string");
		this.mock(_Helper).expects("extend")
			.withExactArgs({strictParsing : true}, oFormatOptions)
			.returns("~mergedFormatOptions");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs("~mergedFormatOptions")
			.returns(oFormat);
		this.mock(oFormat).expects("format").withExactArgs(null, "~timezone").returns("~timezone");

		// code under test
		assert.strictEqual(oType.formatValue([null, "~timezone"], "~targetType"), "~timezone");
	});
});

	//*********************************************************************************************
["any", "boolean", "int", "float"].forEach(function (sType) {
	QUnit.test("formatValue: to " + sType + " not supported", function (assert) {
		var oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getName").withExactArgs().returns("~DateTimeWithTimezone");
		this.mock(oType).expects("getPrimitiveType").withExactArgs("~targetType").returns(sType);

		// code under test
		assert.throws(function () {
			oType.formatValue([UI5Date.getInstance(), "~timezone"], "~targetType");
		}, new FormatException("Don't know how to format ~DateTimeWithTimezone to ~targetType"));
	});
});

	//*********************************************************************************************
	QUnit.test("formatValue: to string", function (assert) {
		var oDate = UI5Date.getInstance(),
			oFormat = {format : function () {}},
			oFormatMock = this.mock(oFormat),
			oType = new DateTimeWithTimezone(),
			oTypeMock = this.mock(oType);

		oType.oFormatOptions = "~formatOptions";

		oTypeMock.expects("getPrimitiveType").withExactArgs("~targetType").returns("string");
		this.mock(_Helper).expects("extend")
			.withExactArgs({strictParsing : true}, "~formatOptions")
			.returns("~mergedFormatOptions");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs("~mergedFormatOptions")
			.returns(oFormat);
		oFormatMock.expects("format").withExactArgs(oDate, "~timezone").returns("~formattedDate");

		// code under test
		assert.strictEqual(oType.formatValue([oDate, "~timezone"], "~targetType"),
			"~formattedDate");

		assert.strictEqual(oType.oFormat, oFormat);

		oTypeMock.expects("getPrimitiveType").withExactArgs("~targetType").returns("string");
		oFormatMock.expects("format").withExactArgs(oDate, "~timezone").returns("~formattedDate");

		// code under test
		assert.strictEqual(oType.formatValue([oDate, "~timezone"], "~targetType"),
			"~formattedDate");
	});

	//*********************************************************************************************
	QUnit.test("formatValue: to object, must not hide time zone", function (assert) {
		var oType = new DateTimeWithTimezone({showDate : false, showTime : false});

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~targetType").returns("object");

		assert.throws(function () {
			// code under test
			oType.formatValue([UI5Date.getInstance(), "~timezone"], "~targetType");
		}, new FormatException("For type 'object', at least one of the format options 'showDate' or"
			+ " 'showTime' must be enabled"));
	});

	//*********************************************************************************************
[
	{showDate : true, showTime : true, showTimezone : true},
	{showDate : true, showTime : false, showTimezone : true},
	{showDate : false, showTime : true, showTimezone : true},
	{showDate : true, showTime : true, showTimezone : false},
	{showDate : false, showTime : true, showTimezone : false},
	{showDate : true, showTime : false, showTimezone : false}
].forEach(function (oFormatOptions, i) {
	QUnit.test("formatValue: to object", function (assert) {
		var oDate = UI5Date.getInstance(),
			oType = new DateTimeWithTimezone(oFormatOptions);

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~targetType").returns("object");

		// code under test
		assert.strictEqual(oType.formatValue([oDate, "~timezone"], "~targetType"), oDate);
	});
});

	//*********************************************************************************************
[{
	formatOptions : {showDate : false, showTime : false, showTimezone : true},
	values : [UI5Date.getInstance(), "Europe/Berlin"],
	result : "Europe, Berlin"
}, {
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "Europe/Berlin"],
	result : "Dec 30, 2021, 5:00:00\u202FAM Europe, Berlin"
}, {
	formatOptions : {showDate : true, showTime : true, showTimezone : false},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "Europe/Berlin"],
	result : "Dec 30, 2021, 5:00:00\u202FAM"
}, {
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "Dec 29, 2021, 11:00:00\u202FPM Americas, New York"
}, {
	formatOptions : {showDate : true, showTime : true, showTimezone : false},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "Dec 29, 2021, 11:00:00\u202FPM"
}, {
	formatOptions : {showDate : false, showTime : false, showTimezone : true},
	values : [null, "Europe/Berlin"],
	result : "Europe, Berlin"
}, {
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	values : [null, "Europe/Berlin"],
	result : "Europe, Berlin"
}, {
	formatOptions : {showDate : true, showTime : false, showTimezone : true},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "Dec 29, 2021 Americas, New York"
}, {
	formatOptions : {showDate : false, showTime : true, showTimezone : true},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "11:00:00\u202FPM Americas, New York"
}, {
	formatOptions : {showDate : true, showTime : false, showTimezone : false},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "Dec 29, 2021"
}, {
	formatOptions : {showDate : false, showTime : true, showTimezone : false},
	values : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "11:00:00\u202FPM"
}].forEach(function (oFixture, i) {
	QUnit.test("formatValue: Integrative tests: " + oFixture.result + ", #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFixture.formatOptions);

		// code under test
		assert.strictEqual(oType.formatValue(oFixture.values, "string"), oFixture.result);
	});
});

	//*********************************************************************************************
[
	undefined,
	null,
	""
].forEach(function (vValue) {
	[
		{showDate : true, showTime : true, showTimezone : true},
		{showDate : true, showTime : true, showTimezone : false}
	].forEach(function (oFormatOptions, i) {
	QUnit.test("parseValue: " + vValue + " to [null, undefined], #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFormatOptions);

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");

		assert.deepEqual(oType.parseValue(vValue, "~sourceType", [/*no relevant*/]),
			[null, undefined]);
	});
	});
});

	//*********************************************************************************************
[
	undefined,
	null,
	""
].forEach(function (vValue, i) {
	var sTitle = "parseValue: time zone is set to default if value is not set and only timezone is "
			+ "displayed; #" + i;

	QUnit.test(sTitle, function (assert) {
		var oType = new DateTimeWithTimezone({showDate : false, showTime : false});

		oType.vEmptyTimezoneValue = "~emptyTimezoneValue";

		assert.deepEqual(oType.parseValue(vValue, "string", [/*not relevant*/]),
			[undefined, "~emptyTimezoneValue"]);
	});
});

	//*********************************************************************************************
	QUnit.test("parseValue: aCurrentValues are mandatory", function (assert) {
		var oType = new DateTimeWithTimezone();

		assert.throws(function () {
			// code under test
			oType.parseValue("~vValue", "~sSourceType", /*aCurrentValues*/ undefined);
		}, new ParseException("'aCurrentValues' is mandatory"));
	});

	//*********************************************************************************************
["any", "boolean", "int", "float"].forEach(function (sType) {
	QUnit.test("parseValue: to " + sType + " not supported", function (assert) {
		var oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getName").withExactArgs().returns("~DateTimeWithTimezone");
		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns(sType);

		// code under test
		assert.throws(function () {
			oType.parseValue("~sValue", "~sourceType", ["~timestamp", "~timezone"]);
		}, new ParseException("Don't know how to parse ~DateTimeWithTimezone from ~sourceType"));
	});
});

	//*********************************************************************************************
	QUnit.test("parseValue: to string; sValue is not parsable", function (assert) {
		var oFormat = {parse : function () {}},
			oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		this.mock(_Helper).expects("extend")
			.withExactArgs({strictParsing : true}, {})
			.returns("~mergedFormatOptions");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs("~mergedFormatOptions")
			.returns(oFormat);
		this.mock(oFormat).expects("parse")
			.withExactArgs("invalidValue", "~timezone")
			.returns(null);
		this.mock(oType).expects("_getErrorMessage").withExactArgs().returns("~errorMessage");

		assert.throws(function () {
			// code under test
			oType.parseValue("invalidValue", "~sourceType", ["~timestamp", "~timezone"]);
		}, new ParseException("~errorMessage"));
	});

	//*********************************************************************************************
	QUnit.test("parseValue: to string; DateFormat throws error", function (assert) {
		var oFormat = {parse : function () {}},
			oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		this.mock(_Helper).expects("extend")
			.withExactArgs({strictParsing : true}, {})
			.returns("~mergedFormatOptions");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs("~mergedFormatOptions")
			.returns(oFormat);
		this.mock(oFormat).expects("parse")
			.withExactArgs("~value", "~timezone")
			.throws(new Error("~errorMessage"));

		assert.throws(function () {
			// code under test
			oType.parseValue("~value", "~sourceType", ["~timestamp", "~timezone"]);
		}, new ParseException("~errorMessage"));
	});

	//*********************************************************************************************
	QUnit.test("parseValue: to string", function (assert) {
		var oFormat = {parse : function () {}},
			oFormatMock = this.mock(oFormat),
			aParsedDate = ["~timestamp", "~timezone"],
			oType = new DateTimeWithTimezone(),
			oTypeMock = this.mock(oType);

		oTypeMock.expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		this.mock(_Helper).expects("extend")
			.withExactArgs({strictParsing : true}, {})
			.returns("~mergedFormatOptions");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs("~mergedFormatOptions")
			.returns(oFormat);
		oFormatMock.expects("parse").withExactArgs("~sValue", "~timezone").returns(aParsedDate);

		// code under test
		assert.strictEqual(oType.parseValue("~sValue", "~sourceType", ["~timestamp", "~timezone"]),
			aParsedDate);

		assert.strictEqual(oType.oFormat, oFormat);

		oTypeMock.expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		oFormatMock.expects("parse").withExactArgs("~sValue", "~timezone").returns(aParsedDate);

		// code under test
		assert.strictEqual(oType.parseValue("~sValue", "~sourceType", ["~timestamp", "~timezone"]),
			aParsedDate);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: to object, a date or time value must be displayed", function (assert) {
		var oType = new DateTimeWithTimezone({showDate : false, showTime : false});

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("object");

		assert.throws(function () {
			// code under test
			oType.parseValue(UI5Date.getInstance(), "~sourceType", [null, "Europe/Berlin"]);
		}, new ParseException("For type 'object', at least one of the format options 'showDate' or"
			+ " 'showTime' must be enabled"));
	});

	//*********************************************************************************************
[
	{showDate : true, showTime : true, showTimezone : true},
	{showDate : true, showTime : true, showTimezone : false}
].forEach(function (oFormatOptions) {
	[undefined, null].forEach(function (vValue) {
	var sTitle = "parseValue: to object, " + vValue + " with format options = "
		+ JSON.stringify(oFormatOptions) + " results in [null, undefined]";

	QUnit.test(sTitle, function (assert) {
		var oType = new DateTimeWithTimezone(oFormatOptions);

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("object");

		// code under test
		assert.deepEqual(oType.parseValue(vValue, "~sourceType", [/*not relevant*/]),
			[null, undefined]);
	});
	});
});

	//*********************************************************************************************
[{}, "foo", 42].forEach(function (vValue) {
	QUnit.test("parseValue: to object, not a Date object", function (assert) {
		var oType = new DateTimeWithTimezone({showTimezone : false});

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("object");

		assert.throws(function () {
			// code under test
			oType.parseValue(vValue, "~sourceType", [null,  "~timezone"]);
		}, new ParseException("Given value must be an instance of Date"));
	});
});

	//*********************************************************************************************
	QUnit.test("parseValue: to object", function (assert) {
		var oDate = UI5Date.getInstance(),
			aResult,
			oType = new DateTimeWithTimezone({showTimezone : false});

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("object");

		// code under test
		aResult = oType.parseValue(oDate, "~sourceType", [null, "~timezone"]);

		assert.deepEqual(aResult, [oDate, undefined]);
		assert.strictEqual(aResult[0], oDate);
	});

	//*********************************************************************************************
[{
	currentTimezone : "Europe/Berlin",
	formatOptions : {showDate : false, showTime : false, showTimezone : true},
	value : "Europe/Berlin",
	result : [undefined, "Europe/Berlin"]
}, {
	currentTimezone : null,
	formatOptions : {showDate : false, showTime : false, showTimezone : true},
	value : "America/New_York",
	result : [undefined, "America/New_York"]
}, {
	currentTimezone : "Europe/Berlin",
	formatOptions : {showDate : true, showTime : true, showTimezone : false},
	value : "Dec 30, 2021, 8:00:00 AM",
	result : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 7, 0, 0)), undefined]
}, {
	currentTimezone : "Europe/Berlin",
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	value : "Dec 30, 2021, 8:00:00 AM Europe/Berlin",
	result : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 7, 0, 0)), "Europe/Berlin"]
}, {
	currentTimezone : "Europe/Berlin",
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	value : "Dec 30, 2021, 8:00:00 AM",
	result : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 7, 0, 0)), undefined]
}, {
	currentTimezone : null,
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	value : "Dec 30, 2021, 8:00:00 AM Europe/Berlin",
	result : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 7, 0, 0)), "Europe/Berlin"]
}, {
	currentTimezone : null,
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	value : "Dec 30, 2021, 8:00:00 AM",
	result : [UI5Date.getInstance(Date.UTC(2021, 11, 30, 8, 0, 0)), undefined]
}].forEach(function (oFixture, i) {
	QUnit.test("parseValue: Integrative tests: #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFixture.formatOptions);

		// code under test
		assert.deepEqual(
			oType.parseValue(oFixture.value, "string", ["~DateOrNull", oFixture.currentTimezone]),
			oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("parseValue: Integrative failing tests", function (assert) {
		assert.throws(function () {
			// code under test
			new DateTimeWithTimezone().parseValue(0, "int", []);
		}, new ParseException("Don't know how to parse " + sClassName + " from int"));

		assert.throws(function () {
			// code under test
			new DateTimeWithTimezone({showDate : true, showTime : false})
				.parseValue("Dec 30, 2021", "string", ["~DateOrNull", null]);
		}, function (oError) {
			return oError instanceof ParseException; // original message text is given by DateFormat
		});

		assert.throws(function () {
			// code under test
			new DateTimeWithTimezone({showDate : false, showTime : true})
				.parseValue("8:00:00 AM", "string", ["~DateOrNull", null]);
		}, function (oError) {
			return oError instanceof ParseException; // original message text is given by DateFormat
		});
	});

	//*********************************************************************************************
[{
	formatOptions : {showDate : true, showTime : true, showTimezone : true},
	messageKey : "EnterDateTime"
}, {
	formatOptions : {showDate : true, showTime : true, showTimezone : false},
	messageKey : "EnterDateTime"
}, {
	formatOptions : {showDate : false, showTime : true, showTimezone : false},
	messageKey : "EnterDateTime"
}, {
	formatOptions : {showDate : true, showTime : false, showTimezone : false},
	messageKey : "EnterDateTime"
}, {
	formatOptions : {showDate : false, showTime : false, showTimezone : true},
	messageKey : "EnterDateTimeTimezone"
}, {
	formatOptions : {showDate : true, showTime : false, showTimezone : true},
	messageKey : "EnterDateTime"
}, {
	formatOptions : {showDate : false, showTime : true, showTimezone : true},
	messageKey : "EnterDateTime"
}].forEach(function (oFixture, i) {
	QUnit.test("_getErrorMessage: #" + i, function (assert) {
		var oDemoDate = UI5Date.getInstance(Date.UTC(UI5Date.getInstance().getFullYear(), 11, 31, 23, 59, 58)),
			oType = new DateTimeWithTimezone(oFixture.formatOptions);

		this.mock(UI5Date).expects("getInstance").withExactArgs().callThrough();
		this.mock(oType).expects("formatValue")
			.withExactArgs([oDemoDate, "America/New_York"], "string")
			.returns("~formattedTime");

		TestUtils.withNormalizedMessages(function () {
			// code under test
			assert.strictEqual(oType._getErrorMessage(), oFixture.messageKey + " ~formattedTime");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("validateValue", function (assert) {
		var oType = new DateTimeWithTimezone();

		// code under test
		oType.validateValue([]);
	});

	//*********************************************************************************************
	QUnit.test("_handleLocalizationChange", function (assert) {
		var oType = new DateTimeWithTimezone();

		oType.oFormat = "~oFormat";

		// code under test
		oType._handleLocalizationChange();

		assert.strictEqual(oType.oFormat, null);
	});

	//*********************************************************************************************
[
	{oFormatOptions : undefined, aResult : []},
	{oFormatOptions : {showDate : true, showTime : true, showTimezone : true}, aResult : []},
	{oFormatOptions : {showDate : false, showTime : false, showTimezone : true}, aResult : [0]},
	{oFormatOptions : {showDate : true, showTime : true, showTimezone : false}, aResult : [1]},
	{oFormatOptions : {showDate : false, showTime : true, showTimezone : false}, aResult : [1]},
	{oFormatOptions : {showDate : true, showTime : false, showTimezone : false}, aResult : [1]}
].forEach(function (oFixture, i) {
	QUnit.test("getPartsIgnoringMessages: #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFixture.oFormatOptions);

		// code under test
		assert.deepEqual(oType.getPartsIgnoringMessages(), oFixture.aResult);
	});
});

	//*********************************************************************************************
[{
	oType : undefined, vValue : null
}, {
	oType : new DecimalType(), vValue : null
}, {
	oType : new StringType(), vValue : null
}, {
	oType : new StringType({parseKeepsEmptyString : "invalid"}), vValue : null
}, {
	oType : new StringType({parseKeepsEmptyString : true}), vValue : ""
}, { // also support subclasses of sap.ui.model.odata.type.String
	oType : new MyStringType({parseKeepsEmptyString : true}), vValue : ""
}].forEach(function (oFixture, i) {
	QUnit.test("processPartTypes, " + i, function (assert) {
		var oType = new DateTimeWithTimezone();

		// code under test
		oType.processPartTypes([undefined, oFixture.oType]);

		assert.strictEqual(oType.vEmptyTimezoneValue, oFixture.vValue);
	});
});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new DateTimeWithTimezone();

		this.mock(DateFormat.prototype).expects("getPlaceholderText").withExactArgs().callsFake(function () {
			assert.strictEqual(this, oType.oFormat);
			return "~placeholder";
		});

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.test("getFormat", function (assert) {
		var oType = new DateTimeWithTimezone();

		assert.strictEqual(oType.oFormat, null);

		// code under test
		var oResult = oType.getFormat();

		assert.ok(oResult instanceof DateFormat);
		assert.strictEqual(oType.oFormat, oResult);
	});
});