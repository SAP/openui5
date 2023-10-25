/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Control",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/test/TestUtils"
], function(Log, Formatting, Localization, CalendarType, Control, UI5Date, DateFormat, FormatException, ParseException, ValidateException, ODataType, TimeOfDay, TestUtils) {
	/*global sinon, QUnit */
	"use strict";

	/*
	 * Tests that the given value leads to a ParseException.
	 */
	function parseError(assert, oType, oValue) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue(oValue, "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ParseException);
				assert.strictEqual(e.message,
					"EnterTime " + oType.formatValue("23:59:58", "string"));
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.TimeOfDay", {
		beforeEach : function () {
			this.sDefaultCalendarType = Formatting.getCalendarType();
			this.sDefaultLanguage = Localization.getLanguage();
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			Formatting.setCalendarType(CalendarType.Gregorian);
			Localization.setLanguage("en-US");
		},
		afterEach : function () {
			Formatting.setCalendarType(this.sDefaultCalendarType);
			Localization.setLanguage(this.sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oFormatOptions = {},
			oType = new TimeOfDay(oFormatOptions);

		assert.ok(oType instanceof TimeOfDay, "is a TimeOfDay");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.TimeOfDay", "type name");
		assert.strictEqual(oType.oFormatOptions, oFormatOptions, "format options");
		assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
		assert.strictEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
		function (assert) {
			var oType = new TimeOfDay(null, null);

			assert.deepEqual(oType.oFormatOptions, null, "no format options");
			assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	[false, true, undefined].forEach(function (bNullable) {
		QUnit.test("with nullable=" + bNullable, function (assert) {
			var oType = new TimeOfDay({}, {nullable : bNullable});

			assert.deepEqual(oType.oConstraints,
				bNullable === false ? {nullable : false} : undefined);
		});
	});

	//*********************************************************************************************
	["false", "true", "foo"].forEach(function (sNullable) {
		QUnit.test("illegal nullable value " + sNullable, function (assert) {
			var oType;

			this.oLogMock.expects("warning")
				.withExactArgs("Illegal nullable: " + sNullable, null,
					"sap.ui.model.odata.type.TimeOfDay");

			oType = new TimeOfDay(null, {nullable : sNullable});

			assert.deepEqual(oType.oConstraints, undefined, "illegal nullable -> default");
		});
	});

	//*********************************************************************************************
	[0, undefined, 12].forEach(function (vPrecision) {
		QUnit.test("with precision=" + vPrecision, function (assert) {
			var oType = new TimeOfDay({}, {precision : vPrecision});

			assert.deepEqual(oType.oConstraints,
				!vPrecision ? undefined : {precision : vPrecision});
		});
	});

	//*********************************************************************************************
	[-1, "foo", "", 42, 8.7, "3"].forEach(function (vPrecision) {
		QUnit.test("illegal precision value " + vPrecision, function (assert) {
			var oType;

			this.oLogMock.expects("warning").withExactArgs("Illegal precision: " + vPrecision, null,
				"sap.ui.model.odata.type.TimeOfDay");

			oType = new TimeOfDay({}, {precision : vPrecision});

			assert.deepEqual(oType.oConstraints, undefined, "illegal precision -> default");
		});
	});

	//*********************************************************************************************
	QUnit.test("multiple constraints", function (assert) {
		var oType = new TimeOfDay({}, {foo : "bar", nullable : false, precision : 12});

		assert.deepEqual(oType.oConstraints, {nullable : false, precision : 12});
	});

	//*********************************************************************************************
	[
		{oFormatOptions : {}, oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : undefined, oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : {strictParsing : false}, oExpected : {UTC : true, strictParsing : false}},
		{oFormatOptions : {UTC : false}, oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : {foo : "bar"},
			oExpected : {UTC : true, strictParsing : true, foo : "bar"}},
		{oFormatOptions : {style : "medium"},
			oExpected : {UTC : true, strictParsing : true, style : "medium"}}
			].forEach(function (oFixture) {
		QUnit.test("formatValue with oFormatOptions=" + JSON.stringify(oFixture.oFormatOptions),
			function (assert) {
				var oDateFormatMock = this.mock(DateFormat),
					oType = new TimeOfDay(oFixture.oFormatOptions);

				assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
						"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");

				oType._resetModelFormatter();
				oDateFormatMock.expects("getTimeInstance") // getModelFormatter
					.withExactArgs({
						calendarType : CalendarType.Gregorian,
						pattern : 'HH:mm:ss',
						strictParsing : true,
						UTC : true
					})
					.callThrough();
				oDateFormatMock.expects("getTimeInstance") // getFormatter
					.withExactArgs(oFixture.oExpected)
					.callThrough();

				// first call
				oType.formatValue("13:53:49", "string");

				// second call - reuse formatters
				oType.formatValue("13:53:49", "string");
			});
	});

	//*********************************************************************************************
	QUnit.test("formatValue success", function (assert) {
		var oDate = UI5Date.getInstance(1970, 0, 1, 2, 53, 49),
			oDateWithMS = UI5Date.getInstance(1970, 0, 1, 13, 53, 49),
			oType = new TimeOfDay(undefined, {precision : 7}),
			sValue = "13:53:49.1234567";

		assert.strictEqual(oType.formatValue(undefined, "foo"), null);
		assert.strictEqual(oType.formatValue(null, "foo"), null);

		assert.strictEqual(oType.formatValue(sValue, "any"), sValue);
		assert.strictEqual(oType.formatValue(sValue, "string"), "1:53:49\u202FPM");

		assert.strictEqual(oType.formatValue("13:53:49", "string"), "1:53:49\u202FPM");

		assert.deepEqual(oType.formatValue("02:53:49", "object"), oDate, "Object");
		assert.deepEqual(oType.formatValue(sValue, "object"), oDateWithMS, "Object with ms");

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.formatValue(sValue, "sap.ui.core.CSSSize"), "1:53:49\u202FPM");
	});

	//*********************************************************************************************
	QUnit.test("formatValue uses UI5Date", function (assert) {
		var oDate = UI5Date.getInstance(Date.UTC(2022, 3, 4, 2, 53, 49)),
			oModelFormat = {parse : function () {}},
			oType = new TimeOfDay();

		this.mock(oType).expects("getModelFormat").withExactArgs().returns(oModelFormat);
		this.mock(oModelFormat).expects("parse").withExactArgs("02:53:49").returns(oDate);
		this.mock(UI5Date).expects("getInstance").withExactArgs(1970, 0, 1, 2, 53, 49).returns("~ui5Date");

		// code under test
		assert.deepEqual(oType.formatValue("02:53:49", "object"), "~ui5Date");
	});

	//*********************************************************************************************
	["int", "boolean", "float"].forEach(function (sTargetType) {
		QUnit.test("formatValue failure for target type " + sTargetType, function (assert) {
			var oType = new TimeOfDay();

			try {
				oType.formatValue("13:53:49", sTargetType);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message,
					"Don't know how to format sap.ui.model.odata.type.TimeOfDay to " + sTargetType);
			}
		});
	});

	//*********************************************************************************************
	["invalid", "25:12"].forEach(function (sValue) {
		QUnit.test("formatValue failure, invalid value " + sValue, function (assert) {
			var oType = new TimeOfDay();

			try {
				oType.formatValue(sValue, "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: " + sValue);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oDate = UI5Date.getInstance(1970, 0, 1, 2, 53, 49),
			oType = new TimeOfDay(),
			oTypePrecision = new TimeOfDay({pattern : "HH:mm:ss.SSS a"}, {precision : 5});

		assert.strictEqual(oType.parseValue(null, "string"), null);
		assert.strictEqual(oType.parseValue("", "string"), null);

		assert.strictEqual(oType.parseValue("1:53:49 PM", "string"), "13:53:49");
		assert.strictEqual(oTypePrecision.parseValue("1:53:49.123 PM", "string"), "13:53:49.12300");

		assert.strictEqual(oType.parseValue(oDate, "object"), "02:53:49", "Date");

		parseError(assert, oType, "foo");
		parseError(assert, oType, "1:69:30 AM");

		Localization.setLanguage("de");
		oType = new TimeOfDay();
		parseError(assert, oType, "24:00:00");
	});

	//*********************************************************************************************
	QUnit.test("parse, get primitive type", function (assert) {
		var oType = new TimeOfDay();

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.parseValue("1:53:49 PM", "sap.ui.core.CSSSize"), "13:53:49");
	});

	//*********************************************************************************************
	[[123, "int"], [true, "boolean"], [1.23, "float"]].forEach(
		function (aFixture) {
			QUnit.test("parse failure for source type " + aFixture[1], function (assert) {
				var oType = new TimeOfDay();

				assert.throws(oType.parseValue.bind(oType, aFixture[0], aFixture[1]),
					new ParseException(
						"Don't know how to parse sap.ui.model.odata.type.TimeOfDay from "
						+ aFixture[1])
				);
			});
		}
	);

	// @see _AnnotationHelperExpression.qunit.js
	//*********************************************************************************************
	QUnit.test("validate success", function (assert) {
		var oType = new TimeOfDay(),
			oTypePrecision = new TimeOfDay(undefined, {precision : 5});

		[null, "23:59", "23:59:59", "23:59:59.1", "23:59:59.123", "23:59:59.12345"]
			.forEach(function (sValue) {
				oTypePrecision.validateValue(sValue);
			});
		oType.validateValue("23:59:59");
		oType.validateValue(null);
	});

	//*********************************************************************************************
	QUnit.test("validate failure", function (assert) {
		var oType = new TimeOfDay(),
			oTypePrecision = new TimeOfDay(undefined, {precision : 5});

		["23", "23:60", "23:59:60", "24:00:00", "23:59:59.123456"]
			.forEach(function (sValue) {
				assert.throws(function () {
					oTypePrecision.validateValue(sValue);
				}, new ValidateException("Illegal sap.ui.model.odata.type.TimeOfDay value: "
					+ sValue)
				);
			});

		assert.throws(function () {
			oType.validateValue("23:59:59.12");
		}, new ValidateException("Illegal sap.ui.model.odata.type.TimeOfDay value: 23:59:59.12"));
	});

	//*********************************************************************************************
	QUnit.test("validate: nullable", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new TimeOfDay({}, {nullable : false});

			assert.throws(oType.validateValue.bind(oType, null),
				new ValidateException("EnterTime 11:59:58\u202FPM"));
		});
	});

	//*********************************************************************************************
	QUnit.test("format, parse, validate with target type object", function (assert) {
		var oType = new TimeOfDay({pattern : "HH:mm:ss.SSS a"}),
			sFormattedDate = oType.formatValue("13:53:49", "object"),
			sResultingDate = oType.parseValue(sFormattedDate, "object");

		oType.validateValue(sResultingDate);
		assert.deepEqual(sResultingDate, "13:53:49", "format and parse did not change the time");
	});

	//*********************************************************************************************
	QUnit.test("getModelFormat() uses Gregorian calendar type", function (assert) {
		var oFormat,
			sModelValue = "13:53:49.123",
			oType = new TimeOfDay(undefined, {precision : 3}),
			oParsedTimeOfDay;

		Formatting.setCalendarType(CalendarType.Japanese);
		oType._resetModelFormatter();

		// code under test
		oFormat = oType.getModelFormat();

		oParsedTimeOfDay = oFormat.parse(sModelValue);
		assert.ok(oParsedTimeOfDay instanceof Date, "parse delivers a Date");
		assert.strictEqual(oParsedTimeOfDay.getTime(), Date.UTC(1970, 0, 1, 13, 53, 49, 123),
			"parse value");
		assert.strictEqual(oFormat.format(oParsedTimeOfDay), sModelValue, "format");
		assert.strictEqual(oFormat.oFormatOptions.calendarType, CalendarType.Gregorian);
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new TimeOfDay(),
			sValue = "13:53:49";

		oControl.bindProperty("tooltip", {path : "/unused", type : oType});
		oType.formatValue(sValue, "string"); // ensure that a formatter exists
		Localization.setLanguage("de");
		assert.strictEqual(oType.formatValue(sValue, "string"), sValue,
			"adjusted to changed language");
	});

	//*********************************************************************************************
	QUnit.test("_resetModelFormatter", function (assert) {
		var oType = new TimeOfDay(),
			oFormat = oType.getModelFormat();

		assert.strictEqual(oFormat, oType.getModelFormat());

		// code under test
		oType._resetModelFormatter();

		assert.notStrictEqual(oFormat, oType.getModelFormat());
	});

	//*********************************************************************************************
	QUnit.test("getModelValue", function (assert) {
		var oFormat = {format : function () {}},
			oInput = UI5Date.getInstance("2022-12-31T14:15:56.789"),
			oType = new TimeOfDay(),
			oTypeMock = this.mock(oType),
			oUI5DateMock = this.mock(UI5Date);

		oUI5DateMock.expects("checkDate").withExactArgs(sinon.match.same(oInput));
		oTypeMock.expects("getModelFormat").withExactArgs().returns(oFormat);
		this.mock(oFormat).expects("format")
			.withExactArgs(UI5Date.getInstance("1970-01-01T14:15:56.789Z"))
			.returns("~result");
		oTypeMock.expects("validateValue").withExactArgs("~result");

		// code under test
		assert.strictEqual(oType.getModelValue(oInput), "~result");

		oUI5DateMock.expects("checkDate").never();
		oTypeMock.expects("getModelFormat").never();
		oTypeMock.expects("validateValue").withExactArgs(null);

		// code under test
		assert.strictEqual(oType.getModelValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: checkDate fails", function (assert) {
		var oType = new TimeOfDay();

		this.mock(UI5Date).expects("checkDate").withExactArgs("~oDate").throws(new Error("~error"));

		// code under test
		assert.throws(function () {
			oType.getModelValue("~oDate");
		}, new Error("~error"));
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: validateValue fails", function (assert) {
		var oFormat = {format : function () {}},
			oType = new TimeOfDay();

		this.mock(oType).expects("getModelFormat").withExactArgs().returns(oFormat);
		this.mock(oFormat).expects("format")
			.withExactArgs(UI5Date.getInstance("1970-01-01T14:15:56.789Z"))
			.returns("~result");
		this.mock(oType).expects("validateValue").withExactArgs("~result").throws(new ValidateException("~error"));

		// code under test
		assert.throws(function () {
			oType.getModelValue(UI5Date.getInstance("2022-12-31T14:15:56.789"));
		}, new ValidateException("~error"));
	});

	//*********************************************************************************************
	QUnit.test("getDateValue", function (assert) {
		var oType = new TimeOfDay();

		this.mock(UI5Date).expects("getInstance").withExactArgs("1970-01-01T~modelValue").returns("~result");

		// code under test
		assert.strictEqual(oType.getDateValue("~modelValue"), "~result");

		// code under test
		assert.strictEqual(oType.getDateValue(null), null);
	});

	//*********************************************************************************************
[{
	constraints : undefined,
	sInitialDate : "2023-03-29T08:07:06",
	sExpectedDateValue : "1970-01-01T08:07:06",
	sExpectedModelValue : "08:07:06"
}, {
	constraints : undefined,
	sInitialDate : "2023-03-29T08:07",
	sExpectedDateValue : "1970-01-01T08:07",
	sExpectedModelValue : "08:07:00"
}, {
	constraints : {precision : 5},
	sInitialDate : "2023-03-29T08:07:06.12345",
	sExpectedDateValue : "1970-01-01T08:07:06.123",
	sExpectedModelValue : "08:07:06.12300"
}].forEach(function (oFixture, i) {
	QUnit.test("Integrative test getModelValue/getDateValue " + i, function (assert) {
		var oDateValue, sModelValue,
			oType = new TimeOfDay(undefined, oFixture.constraints);

		// code under test, the time added to the constructor, makes sure the created date a locale date
		sModelValue = oType.getModelValue(UI5Date.getInstance(oFixture.sInitialDate));

		assert.strictEqual(sModelValue, oFixture.sExpectedModelValue);

		// code under test
		oDateValue = oType.getDateValue(sModelValue);

		// The time added to the constructor, makes sure the created date a locale date
		assert.deepEqual(oDateValue, UI5Date.getInstance(oFixture.sExpectedDateValue));

		// code under test
		sModelValue = oType.getModelValue(oDateValue);

		assert.strictEqual(sModelValue, oFixture.sExpectedModelValue);
	});
});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new TimeOfDay();

		this.mock(DateFormat.prototype).expects("getPlaceholderText").withExactArgs().callsFake(function () {
			assert.strictEqual(this, oType.oFormat);
			return "~placeholder";
		});

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.test("getFormat", function (assert) {
		var oType = new TimeOfDay();

		assert.strictEqual(oType.oFormat, undefined);

		// code under test
		var oResult = oType.getFormat();

		assert.ok(oResult instanceof DateFormat);
		assert.strictEqual(oType.oFormat, oResult);
	});

	//*********************************************************************************************
	QUnit.test("getISOStringFromModelValue: integrative test", function (assert) {
		assert.strictEqual(new TimeOfDay().getISOStringFromModelValue("09:15:30"), "09:15:30");
	});

	//*********************************************************************************************
["getISOStringFromModelValue", "getModelValueFromISOString"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": falsy values", function (assert) {
		var oType = new TimeOfDay();

		assert.strictEqual(oType[sMethod](null), null);
		assert.strictEqual(oType[sMethod](undefined), null);
		assert.strictEqual(oType[sMethod](""), null);
	});
});

	//*********************************************************************************************
	// Enhance existing integration test for TimeOfDay#getModelValueFromISOString with and without precision
	// constraints. It is expected that the milliseconds in the ISO string are either truncated or padded with 0
	// according to the set precision.
	// BCP: 2380114882
	[{
		sISOString: "09:15:30.12",
		sModelValue: "09:15:30.12",
		iPrecision: 2
	}, {
		sISOString: "09:15:30.123",
		sModelValue: "09:15:30.12",
		iPrecision: 2
	}, {
		sISOString: "09:15:30.12",
		sModelValue: "09:15:30.1200",
		iPrecision: 4
	}, {
		sISOString: "09:15:30.12",
		sModelValue: "09:15:30",
		iPrecision: undefined
	}].forEach(function (oFixture, i) {
		const sTitle = "getModelValueFromISOString: integrative test #" + i;
		QUnit.test(sTitle, function (assert) {
			const oType = new TimeOfDay({}, {precision: oFixture.iPrecision});

			// code under test
			assert.strictEqual(oType.getModelValueFromISOString(oFixture.sISOString), oFixture.sModelValue);
		});
	});
});
