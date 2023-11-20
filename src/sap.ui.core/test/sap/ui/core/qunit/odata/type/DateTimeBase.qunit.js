/*!
 *{copyright}
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
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/DateTimeBase",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function(Log, Formatting, Localization, CalendarType, Control, UI5Date, DateFormat, FormatException,
	ParseException, ValidateException, JSONModel, DateTime, DateTimeBase, DateTimeOffset, ODataType,
	TestUtils) {
	/*global QUnit */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var oDateOnly = UI5Date.getInstance(Date.UTC(2014, 10, 27, 0, 0, 0, 0)),
		oDateTime = UI5Date.getInstance(2014, 10, 27, 13, 47, 26),
		sDateTimeOffset = "2014-11-27T13:47:26" + getTimezoneOffset(oDateTime),
		sDateTimeOffsetWithMS = "2014-11-27T13:47:26.456" + getTimezoneOffset(oDateTime),
		sDateTimeOffsetYear0 = "0000-11-27T13:47:26" + getTimezoneOffset(oDateTime),
		oDateTimeUTC = UI5Date.getInstance(Date.UTC(2014, 10, 27, 13, 47, 26)),
		oDateTimeWithMS = UI5Date.getInstance(2014, 10, 27, 13, 47, 26, 456),
		sFormattedDateOnly = "Nov 27, 2014",
		sFormattedDateTime = "Nov 27, 2014, 1:47:26\u202FPM",
//		sFormattedDateTimeWithMS = "Nov 27, 2014, 1:47:26.456 PM",
		iFullYear = UI5Date.getInstance().getFullYear(),
		oMessages = {
			"EnterDateTime" : "EnterDateTime Dec 31, " + iFullYear + ", 11:59:58\u202FPM",
			"EnterDate" : "EnterDate Dec 31, " + iFullYear
		};

	function createInstance(oTypeClass, oFormatOptions, oConstraints) {
		// eslint-disable-next-line new-cap
		return new oTypeClass(oFormatOptions, oConstraints);
	}

	/*
	 * @param {Date} oDate
	 *   Any <code>Date</code> instance
	 * @returns {string}
	 *   The given date's timezone offset as a string, e.g. "+01:00" or "+05:45" (Kathmandu)
	 */
	function getTimezoneOffset(oDate) {
		var iTimezoneOffset = oDate.getTimezoneOffset(),
			iMinutes = Math.abs(iTimezoneOffset) % 60,
			iHours = (Math.abs(iTimezoneOffset) - iMinutes) / 60,
			sTimezoneOffset = iTimezoneOffset < 0 ? "+" : "-";

		if (iTimezoneOffset === 0) {
			return "Z";
		}
		if (iHours < 10) {
			sTimezoneOffset += "0";
		}
		sTimezoneOffset += iHours;
		sTimezoneOffset +=  ":";
		if (iMinutes < 10) {
			sTimezoneOffset += "0";
		}
		sTimezoneOffset += iMinutes;
		return sTimezoneOffset;
	}

	/*
	 * Wrapper to <code>QUnit.module</code> to provide a consistent test environment.
	 *
	 * @param {object} oTypeClass
	 *   The type class under test within this module
	 */
	function module(oTypeClass) {
		QUnit.module(oTypeClass.getMetadata().getName(), {
			before : function () {
				this.__ignoreIsolatedCoverage__ = oTypeClass === DateTimeBase;
			},
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
	}

	/*
	 * Tests that the given value leads to a ParseException.
	 */
	function parseError(assert, oType, oValue, sExpectedErrorKey, sReason) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue(oValue, "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ParseException, sReason + ": exception");
				assert.strictEqual(e.message, oMessages[sExpectedErrorKey], sReason + ": message");
			}
		});
	}

	/*
	 * Tests that the given value leads to a ValidateException.
	 */
	function validateError(assert, oType, oValue, sExpectedErrorKey, sReason) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.validateValue(oValue);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException, sReason + ": exception");
				assert.strictEqual(e.message, oMessages[sExpectedErrorKey], sReason + ": message");
			}
		});
	}

	/*
	 * Tests the validation for a DateTime with the given constraints.
	 */
	function validate(assert, oTypeClass, oConstraints, sExpectedErrorKey) {
		var oDate = UI5Date.getInstance(),
			oType = createInstance(oTypeClass, undefined, oConstraints);

		oType.validateValue(null);

		oConstraints.nullable = false;
		oType = createInstance(oTypeClass, undefined, oConstraints);
		validateError(assert, oType, null, sExpectedErrorKey, "nullable");

		[undefined, false, 0, 1, "foo"].forEach(function (vValue) {
			try {
				oType.validateValue(vValue);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "Illegal " + oTypeClass.getMetadata().getName()
					+ " value: " + vValue, vValue);
			}
		});
		oDate.setFullYear(0);
		validateError(assert, oType, oDate, sExpectedErrorKey, "year 0");
		oType.validateValue(UI5Date.getInstance());
	}

	/*
	 * Tests that format and parse do not change the date and that validate accepts it.
	 */
	function formatParseValidate(assert, oTypeClass, oConstraints, oTestDate) {
		var oType = createInstance(oTypeClass, undefined, oConstraints),
			sFormattedDate = oType.formatValue(oTestDate, "string"),
			oResultingDate = oType.parseValue(sFormattedDate, "string");

		oType.validateValue(oResultingDate);
		assert.deepEqual(oResultingDate, oTestDate, "format and parse did not change the date");
	}

	//*********************************************************************************************
	function dateTime(oTypeClass) {

		//*****************************************************************************************
		QUnit.test("basics", function (assert) {
			var oType = createInstance(oTypeClass);

			assert.ok(oType instanceof DateTimeBase, "is a DateTime");
			assert.ok(oType instanceof ODataType, "is an ODataType");
			assert.strictEqual(oType.getName(), oTypeClass.getMetadata().getName(), "type name");
			assert.strictEqual(oType.oFormatOptions, undefined, "format options ignored");
			assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
			assert.strictEqual(oType.oConstraints, undefined, "default constraints");
			assert.strictEqual(oType.oFormat, null, "no formatter preload");

			createInstance(oTypeClass, null, null); // null vs. undefined MUST not make a difference!
		});

		//*****************************************************************************************
		QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
			function (assert) {
				var oType = createInstance(oTypeClass, null, null);

				assert.deepEqual(oType.oFormatOptions, null, "no format options");
				assert.deepEqual(oType.oConstraints, undefined, "default constraints");
		});

		//*****************************************************************************************
		QUnit.test("formatValue", function (assert) {
			var oType = createInstance(oTypeClass);

			assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
			assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
			assert.strictEqual(oType.formatValue(oDateTime, "any"), oDateTime, "target type any");
			assert.strictEqual(oType.formatValue(oDateTime, "string"), sFormattedDateTime,
				"target type string");
			["int", "float", "boolean"].forEach(function (sType) {
				try {
					oType.formatValue(oDateTime, sType);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof FormatException);
					assert.strictEqual(e.message,
						"Don't know how to format " + oTypeClass.getMetadata().getName() + " to " + sType);
				}
			});

			this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
				.atLeast(1).returns("string");
			assert.strictEqual(oType.formatValue(oDateTime, "sap.ui.core.CSSSize"),
				sFormattedDateTime);

			oType = createInstance(oTypeClass, {}, {precision : 3});
			// TODO DateFormat only supports split seconds using a locale-dependent pattern
			assert.strictEqual(oType.formatValue(oDateTimeWithMS, "string"),
				sFormattedDateTime, "format with precision");
		});

		//*****************************************************************************************
		QUnit.test("parseValue", function (assert) {
			var oType = createInstance(oTypeClass);

			assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
			assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
			assert.deepEqual(oType.parseValue(sFormattedDateTime, "string"), oDateTime);

			["int", "float", "boolean"].forEach(function (sType) {
				try {
					oType.parseValue(sFormattedDateTime, sType);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof ParseException, sType + ": exception");
					assert.strictEqual(e.message,
						"Don't know how to parse " + oTypeClass.getMetadata().getName() + " from "
						+ sType, sType + ": message");
				}
			});

			parseError(assert, oType, "foo", "EnterDateTime", "not a date");
			parseError(assert, oType, "Feb 28, 2014, 11:69:30 AM", "EnterDateTime",
				"invalid time");

			this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
				.returns("string");
			assert.deepEqual(oType.parseValue(sFormattedDateTime, "sap.ui.core.CSSSize"),
				oDateTime);

			oType = createInstance(oTypeClass, {}, {precision : 3});
//			TODO not supported by DateFormat
//			assert.deepEqual(oType.parseValue(sFormattedDateTimeWithMS, "string"),
//				oDateTimeWithMS, "parse with precision");
		});

		//*****************************************************************************************
		QUnit.test("validateValue", function (assert) {
			validate(assert, oTypeClass, {}, "EnterDateTime");
		});

		//*****************************************************************************************
		QUnit.test("format, parse, validate", function (assert) {
			formatParseValidate(assert, oTypeClass, undefined, oDateTime);
		});

		//*****************************************************************************************
		QUnit.test("localization change", function (assert) {
			var oControl = new Control(),
				oType = createInstance(oTypeClass);

			oControl.bindProperty("tooltip", {path : "/unused", type : oType});
			Localization.setLanguage("de-DE");
			assert.strictEqual(oType.formatValue(oDateTime, "string"),
				DateFormat.getDateTimeInstance().format(oDateTime),
				"adjusted to changed language");

			oControl.destroy();
		});

		//*****************************************************************************************
		QUnit.test("format option UTC", function (assert) {
			var oType = createInstance(oTypeClass, {UTC : true}),
				oDateTime = UI5Date.getInstance(Date.UTC(2014, 10, 27, 13, 47, 26)),
				sFormattedDateTime = "Nov 27, 2014, 1:47:26\u202FPM";

			assert.strictEqual(oType.formatValue(oDateTime, "string"), sFormattedDateTime);
			assert.deepEqual(oType.parseValue(sFormattedDateTime, "string"), oDateTime);
		});

		//*****************************************************************************************
		QUnit.test("getModelFormat", function (assert) {
			var oType = createInstance(oTypeClass),
				oFormat = oType.getModelFormat();

			assert.equal(oFormat.format(oDateTime), oDateTime, "format");
			assert.equal(oFormat.parse(sFormattedDateTime), sFormattedDateTime, "parse");
		});

		//*****************************************************************************************
		QUnit.test("format: bad input type", function (assert) {
			var oBadModelValue = "foo",
				oType = createInstance(oTypeClass);

			assert.throws(function () {
				oType.formatValue(oBadModelValue, "string");
			}, new FormatException("Illegal " + oType.getName() + " value: " + oBadModelValue));
			assert.strictEqual(oType.formatValue(oBadModelValue, "any"), oBadModelValue);
		});

		//*****************************************************************************************
		QUnit.test("getModelValue: validateValue fails", function (assert) {
			var oType = createInstance(oTypeClass);

			this.mock(oType).expects("_getModelValue").withExactArgs("~oDate").returns("~oResult");
			this.mock(oType).expects("validateValue")
				.withExactArgs("~oResult")
				.throws(new ValidateException("~exception"));

			// code under test
			assert.throws(function () {
				oType.getModelValue("~oDate");
			}, new ValidateException("~exception"));
		});
	}

	module(DateTimeBase);

	//*********************************************************************************************
	QUnit.test("constraints undefined", function (assert) {
		var oType = new DateTimeBase({}, undefined);

		assert.deepEqual(oType.oConstraints, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getErrorMessage", function (assert) {
		var oDate = {getFullYear : function () {}},
			oDateMock = this.mock(oDate),
			oUI5DateMock = this.mock(UI5Date),
			that = this;

		TestUtils.withNormalizedMessages(function () {
			var oExpectedDate = UI5Date.getInstance(Date.UTC(2022, 11, 31)),
				oType = new DateTimeBase({}, {isDateOnly: true});

			oUI5DateMock.expects("getInstance").withExactArgs().returns(oDate);
			oDateMock.expects("getFullYear").withExactArgs().returns(2022);
			that.mock(oType).expects("formatValue")
				.withExactArgs(oExpectedDate, "string")
				.returns("~formattedDate");

			// code under test: Date
			assert.strictEqual(oType._getErrorMessage(), "EnterDate ~formattedDate");
		});

		TestUtils.withNormalizedMessages(function () {
			var oType = new DateTimeBase({}, {isDateOnly: false});

			oUI5DateMock.expects("getInstance").withExactArgs().returns(oDate);
			oDateMock.expects("getFullYear").withExactArgs().returns(2022);
			oUI5DateMock.expects("getInstance").withExactArgs(2022, 11, 31, 23, 59, 58).returns("~ui5date");
			that.mock(oType).expects("formatValue").withExactArgs("~ui5date", "string").returns("~formattedDate");

			// code under test: DateTime
			assert.strictEqual(oType._getErrorMessage(), "EnterDateTime ~formattedDate");
		});
	});

	//*********************************************************************************************
	QUnit.test("_getModelValue: null handling", function (assert) {
		var oType = new DateTimeBase();

		assert.strictEqual(oType._getModelValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("_getModelValue: checkDate fails", function (assert) {
		var oType = new DateTimeBase();

		this.mock(UI5Date).expects("checkDate").withExactArgs("~oDate").throws(new Error("~error"));

		// code under test
		assert.throws(function () {
			oType._getModelValue("~oDate");
		}, new Error("~error"));
	});

	//*********************************************************************************************
	QUnit.test("_getModelValue", function (assert) {
		var oInput = UI5Date.getInstance("0099-12-31T08:07:06"),
			oResult = UI5Date.getInstance("0099-12-31T00:00:00Z"),
			oType = new DateTimeBase({}, {isDateOnly : true});

		// code under test: Date-only
		assert.deepEqual(oType._getModelValue(oInput), oResult);

		oType = new DateTimeBase({UTC : true}, {isDateOnly : true});

		// code under test: Date-only, UTC=true
		assert.deepEqual(oType._getModelValue(oInput), oResult);

		oType = new DateTimeBase();
		oInput = UI5Date.getInstance(2022, 11, 31, 8, 7, 6, 42);

		// code under test: UTC=false
		oResult = oType._getModelValue(oInput);

		assert.deepEqual(oResult, oInput);
		assert.notStrictEqual(oResult, oInput);

		oType = new DateTimeBase({UTC : true});

		// code under test: UTC=true
		assert.deepEqual(
			oType._getModelValue(UI5Date.getInstance("0099-12-31T08:07:06.042")),
			UI5Date.getInstance("0099-12-31T08:07:06.042Z"));
	});

	//*********************************************************************************************
	QUnit.test("getDateValue: null handling", function (assert) {
		var oType = new DateTimeBase();

		assert.strictEqual(oType.getDateValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("getDateValue", function (assert) {
		var oInput = UI5Date.getInstance("0099-12-31T08:07:06Z"),
			oResult = UI5Date.getInstance("0099-12-31T00:00:00"),
			oType = new DateTimeBase({}, {isDateOnly: true});

		// code under test: Date-only
		assert.deepEqual(oType.getDateValue(oInput), oResult);

		oType = new DateTimeBase({UTC: true}, {isDateOnly: true});

		// code under test: Date-only, UTC=true
		assert.deepEqual(oType.getDateValue(oInput), oResult);

		oType = new DateTimeBase();
		oInput = UI5Date.getInstance(2022, 11, 31, 8, 7, 6, 42);

		// code under test: UTC=false
		oResult = oType.getDateValue(oInput);

		assert.deepEqual(oResult, oInput);
		assert.notStrictEqual(oResult, oInput);

		oType = new DateTimeBase({UTC: true});

		// code under test: UTC=true
		assert.deepEqual(
			oType.getDateValue(UI5Date.getInstance("0099-12-31T08:07:06.042Z")),
			UI5Date.getInstance("0099-12-31T08:07:06.042"));
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new DateTimeBase();

		this.mock(DateFormat.prototype).expects("getPlaceholderText").withExactArgs().callsFake(function () {
			assert.strictEqual(this, oType.oFormat);
			return "~placeholder";
		});

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.test("getFormat", function (assert) {
		var oType = new DateTimeBase();

		assert.strictEqual(oType.oFormat, null);

		// code under test
		var oResult = oType.getFormat();

		assert.ok(oResult instanceof DateFormat);
		assert.strictEqual(oType.oFormat, oResult);
	});

	//*********************************************************************************************
	//*********************************************************************************************
	module(DateTime);

	dateTime(DateTime);

	//*********************************************************************************************
	[
		{i : {}, o : undefined},
		{i : {nullable : true, displayFormat : "Date"}, o : {isDateOnly : true}},
		{i : {nullable : false, displayFormat : "foo"}, o : {nullable : false},
			warning : "Illegal displayFormat: foo"},
		{i : {nullable : "true", displayFormat : 1}, o : undefined,
			warning : "Illegal displayFormat: 1"},
		{i : {nullable : "false"}, o : {nullable : false}},
		{i : {nullable : "foo"}, o : undefined, warning : "Illegal nullable: foo"}
	].forEach(function (oFixture) {
		QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
			var oType;

			if (oFixture.warning) {
				this.oLogMock.expects("warning")
					.withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.DateTime");
			}

			oType = new DateTime({}, oFixture.i);
			assert.deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	QUnit.test("getConstraints", function (assert) {
		var oType = new DateTime(undefined, {});

		// code under test
		assert.deepEqual(oType.getConstraints(), {});

		oType = new DateTime(undefined, {displayFormat : "Date"});

		// code under test
		assert.deepEqual(oType.getConstraints(), {displayFormat : "Date"});
	});

	//*********************************************************************************************
	[
		{oFormatOptions : {},  oExpected : {strictParsing : true}},
		{oFormatOptions : undefined, oExpected : {strictParsing : true}},
		{oFormatOptions : {strictParsing : false, UTC : true},
			oExpected : {strictParsing : false, UTC : true}},
		{oFormatOptions : {foo : "bar"}, oExpected : {strictParsing : true, foo : "bar"}},
		{oFormatOptions : {style : "medium"}, oExpected : {strictParsing : true, style : "medium"}},
		// with displayFormat = Date
		{oFormatOptions : {}, oConstraints : {displayFormat : "Date"},
			oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : undefined, oConstraints : {displayFormat : "Date"},
			oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : {strictParsing : false}, oConstraints : {displayFormat : "Date"},
			oExpected : {UTC : true, strictParsing : false}},
		{oFormatOptions : {foo : "bar"}, oConstraints : {displayFormat : "Date"},
			oExpected : {UTC : true, strictParsing : true, foo : "bar"}},
		{oFormatOptions : {UTC : false}, oConstraints : {displayFormat : "Date"},
			oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : {style : "medium"}, oConstraints : {displayFormat : "Date"},
			oExpected : {UTC : true, strictParsing : true, style : "medium"}}
	].forEach(function (oFixture) {
		QUnit.test("formatOptions=" + JSON.stringify(oFixture.oFormatOptions),
			function (assert) {
					var oType = new DateTime(oFixture.oFormatOptions, oFixture.oConstraints),
					oSpy = (oFixture.oConstraints) ?
						this.spy(DateFormat, "getDateInstance") :
						this.spy(DateFormat, "getDateTimeInstance");

				assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
					"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
				oType.formatValue(oDateTime, "string");
				assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
			});
	});

	//*********************************************************************************************
	QUnit.test("format and parse (Date only)", function (assert) {
		var oType = new DateTime({}, {displayFormat : "Date"});

		assert.strictEqual(oType.formatValue(oDateOnly, "string"), sFormattedDateOnly,
			"target type string");
		assert.deepEqual(oType.parseValue(sFormattedDateOnly, "string"), oDateOnly);

		parseError(assert, oType, "Feb 30, 2014", "EnterDate", "invalid date");
	});

	//*********************************************************************************************
	QUnit.test("format and parse with type object", function (assert) {
		var oType = new DateTime();

		// code under test
		assert.strictEqual(oType.formatValue(oDateTime, "object"), oDateTime);
		assert.strictEqual(oType.parseValue(oDateTime, "object"), oDateTime);
	});

	//*********************************************************************************************
	QUnit.test("format and parse with type object (Date only)", function (assert) {
		var oType = new DateTime({}, {displayFormat : "Date"});

		this.mock(oType).expects("getDateValue").withExactArgs(oDateOnly).returns("~dateValue");

		// code under test
		assert.strictEqual(oType.formatValue(oDateOnly, "object"), "~dateValue");

		this.mock(oType).expects("_getModelValue").withExactArgs(oDateOnly).returns("~modelValue");

		// code under test
		assert.strictEqual(oType.parseValue(oDateOnly, "object"), "~modelValue");
	});

	//*********************************************************************************************
	QUnit.test("validate (Date only)", function (assert) {
		validate(assert, DateTime, {displayFormat : "Date"}, "EnterDate");
	});

	//*********************************************************************************************
	QUnit.test("format, parse, validate (Date only)", function (assert) {
		formatParseValidate(assert, DateTime, {displayFormat : "Date"}, oDateOnly);
	});

	//*********************************************************************************************
	QUnit.test("getModelValue", function (assert) {
		var oType = new DateTime();

		this.mock(oType).expects("_getModelValue").withExactArgs("~date").returns("~result");
		this.mock(oType).expects("validateValue").withExactArgs("~result");

		// code under test
		assert.strictEqual(oType.getModelValue("~date"), "~result");
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: integrative test", function (assert) {
		var oResult,
			oInput = UI5Date.getInstance(2022, 11, 31, 8, 7, 6),
			oType = new DateTime({}, {displayFormat : "Date"});

		oResult = oType.parseValue(DateFormat.getDateInstance().format(oInput), "string");

		// code under test: Date-only
		assert.deepEqual(oType.getModelValue(oInput), oResult);

		oType = new DateTime();
		oResult = oType.parseValue(DateFormat.getDateTimeInstance().format(oInput), "string");

		// code under test: UTC=false
		assert.deepEqual(oType.getModelValue(oInput), oResult);

		oType = new DateTime({UTC : true});
		oResult = oType.parseValue(DateFormat.getDateTimeInstance().format(oInput), "string");

		// code under test: UTC=true
		assert.deepEqual(oType.getModelValue(oInput), oResult);
	});

	//*********************************************************************************************
[{
	constraints: {},
	formatOptions: {},
	initialDate: "2022-06-30T08:07:06",
	expectedDateValue: "2022-06-30T08:07:06",
	expectedModelValue: "2022-06-30T08:07:06"
}, {
	constraints: {},
	formatOptions: {UTC: true},
	initialDate: "2022-06-30T08:07:06",
	expectedDateValue: "2022-06-30T08:07:06",
	expectedModelValue: "2022-06-30T08:07:06Z"
}, {
	constraints: {displayFormat: "Date"},
	formatOptions: {},
	initialDate: "2022-06-30T08:07:06",
	expectedDateValue: "2022-06-30T00:00:00",
	expectedModelValue: "2022-06-30T00:00:00Z"
}].forEach(function (oFixture, i) {
	QUnit.test("Integrative test getModelValue/getDateValue " + i, function (assert) {
		var oDateValue, oModelValue,
			oInitialDate = UI5Date.getInstance(oFixture.initialDate),
			oExpectedDateValue = UI5Date.getInstance(oFixture.expectedDateValue),
			oExpectedModelValue = UI5Date.getInstance(oFixture.expectedModelValue),
			oType = new DateTime(oFixture.formatOptions, oFixture.constraints);

		// code under test
		oModelValue = oType.getModelValue(oInitialDate);

		assert.deepEqual(oModelValue, oExpectedModelValue);

		// code under test
		oDateValue = oType.getDateValue(oModelValue);

		assert.deepEqual(oDateValue, oExpectedDateValue);

		// code under test
		oModelValue = oType.getModelValue(oDateValue);

		assert.deepEqual(oModelValue, oExpectedModelValue);
	});
});

	//*********************************************************************************************
[new DateTime(), new DateTime({}, {displayFormat : "Date"})].forEach(function (oType, i) {
	QUnit.test("getISOStringFromModelValue: falsy values " + i, function (assert) {
		assert.strictEqual(oType.getISOStringFromModelValue(null), null);
		assert.strictEqual(oType.getISOStringFromModelValue(undefined), null);
	});
});

	//*********************************************************************************************
[new DateTime(), new DateTime({}, {displayFormat : "Date"})].forEach(function (oType, i) {
	QUnit.test("getModelValueFromISOString " + i, function (assert) {
		this.mock(UI5Date).expects("getInstance").withExactArgs("~sISOString").returns("~oDate");

		assert.strictEqual(oType.getModelValueFromISOString("~sISOString"), "~oDate");
	});
});

	//*********************************************************************************************
[new DateTime(), new DateTime({}, {displayFormat : "Date"})].forEach(function (oType, i) {
	QUnit.test("getModelValueFromISOString: falsy values " + i, function (assert) {
		assert.strictEqual(oType.getModelValueFromISOString(null), null);
		assert.strictEqual(oType.getModelValueFromISOString(undefined), null);
		assert.strictEqual(oType.getModelValueFromISOString(""), null);
	});
});

	//*********************************************************************************************
[{
		sDateString: "2023-07-31T09:15:30Z",
		sISOString: "2023-07-31T09:15:30.000Z",
		sExpectedISOString: "2023-07-31T09:15:30.000Z"
}, {
		sDateString: "0099-09-25T12:30:45.123Z",
		sISOString: "0099-09-25T12:30:45.123Z",
		sExpectedISOString: "0099-09-25T12:30:45.123Z"
}, {
		sDateString: "0009-06-30T00:00:00.123Z",
		sISOString: "0009-06-29T23:00:00.123-01:00",
		sExpectedISOString: "0009-06-30T00:00:00.123Z"
}, {
		sDateString: "2022-06-30T09:15:45.1Z",
		sISOString: "2022-06-30T10:15:45.1+01:00",
		sExpectedISOString: "2022-06-30T09:15:45.100Z"
}].forEach(function (oFixture, i) {
	QUnit.test("getISOStringFromModelValue/getModelValueFromISOString: integrative test (timestamps) " + i,
		function (assert) {
			var oDate = UI5Date.getInstance(oFixture.sDateString),
				oType = new DateTime();

			assert.strictEqual(oType.getISOStringFromModelValue(oDate), oFixture.sExpectedISOString);
			assert.deepEqual(oType.getModelValueFromISOString(oFixture.sISOString), oDate);
		}
	);
});

	//*********************************************************************************************
	QUnit.test("getISOStringFromModelValue/getModelValueFromISOString: integrative (Date)", function (assert) {
		var oDate = UI5Date.getInstance("2023-04-20"),
			oType = new DateTime({}, {displayFormat : "Date"});

		assert.strictEqual(oType.getISOStringFromModelValue(oDate), "2023-04-20");
		assert.deepEqual(oType.getModelValueFromISOString("2023-04-20"), oDate);
	});

	//*********************************************************************************************
	//*********************************************************************************************
	module(DateTimeOffset);

	dateTime(DateTimeOffset);

	//*********************************************************************************************
	[
		{i : {"foo" : "bar"}, o : undefined},
		{i : {}, o : undefined},
		{i : {nullable : true, displayFormat : "Date"}, o : undefined},
		{i : {nullable : false, isDateOnly : true}, o : {nullable : false}},
		{i : {nullable : "true"}, o : undefined},
		{i : {nullable : "false"}, o : {nullable : false}},
		{i : {nullable : "foo"}, o : undefined, warning : "Illegal nullable: foo"},
		{i : {precision : undefined}, o : undefined},
		{i : {precision : -0}, o : undefined},
		{i : {precision : 0}, o : undefined},
		{i : {precision : 1}, o : {precision : 1}},
		{i : {precision : 3}, o : {precision : 3}},
		{i : {precision : 12}, o : {precision : 12}},
		{i : {precision : ""}, o : undefined, warning : "Illegal precision: "},
		{i : {precision : "foo"}, o : undefined, warning : "Illegal precision: foo"},
		{i : {precision : -1}, o : undefined, warning : "Illegal precision: -1"},
		{i : {precision : 0.9}, o : undefined, warning : "Illegal precision: 0.9"},
		{i : {precision : 3.14}, o : undefined, warning : "Illegal precision: 3.14"},
		{i : {precision : 12.1}, o : undefined, warning : "Illegal precision: 12.1"},
		{i : {nullable : "false", precision : 3}, o : {nullable : false, precision : 3}},
		{i : {V4 : undefined}, o : undefined},
		{i : {V4 : false}, o : undefined},
		{i : {V4 : true}, o : undefined}, // not stored inside oConstraints
		{i : {V4 : 0}, o : undefined, warning : "Illegal V4: 0"}
	].forEach(function (oFixture) {
		QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
			var oType;

			if (oFixture.warning) {
				this.oLogMock.expects("warning")
					.withExactArgs(oFixture.warning, null,
						"sap.ui.model.odata.type.DateTimeOffset");
			}

			oType = new DateTimeOffset({}, oFixture.i);
			assert.deepEqual(oType.oConstraints, oFixture.o);
			assert.deepEqual(oType.bV4, !!oFixture.i.V4);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bV4) {
		QUnit.test("getConstraints: {V4 : " + bV4 + "}", function (assert) {
			var oType = new DateTimeOffset(undefined, {V4 : bV4});

			// code under test
			assert.deepEqual(oType.getConstraints(), bV4 ? {V4 : bV4} : {});
		});
	});

	//*********************************************************************************************
	[
		{oFormatOptions : {},  oExpected : {strictParsing : true}},
		{oFormatOptions : undefined, oExpected : {strictParsing : true}},
		{oFormatOptions : {strictParsing : false}, oExpected : {strictParsing : false}},
		{oFormatOptions : {foo : "bar"}, oExpected : {strictParsing : true, foo : "bar"}},
		{oFormatOptions : {style : "medium"}, oExpected : {strictParsing : true, style : "medium"}}
	].forEach(function (oFixture) {
		QUnit.test("formatOptions=" + JSON.stringify(oFixture.oFormatOptions),
			function (assert) {
				var oType = new DateTimeOffset(oFixture.oFormatOptions, {}),
					oSpy = this.spy(DateFormat, "getDateTimeInstance");

				assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
					"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
				oType.formatValue(oDateTime, "string");
				assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
			});
	});

	//*********************************************************************************************
	QUnit.test("setV4", function (assert) {
		var oDateTimeOffsetV4 = new DateTimeOffset(undefined, {precision : 7}).setV4(),
			sDateTimeOffsetFromObjectSource = oDateTimeOffsetV4.parseValue(oDateTime, "object"),
			sDateTimeOffsetParsed = oDateTimeOffsetV4.parseValue(sFormattedDateTime, "string"),
			sDateTimeOffsetWithPrecision = "2014-11-27T13:47:26.0000000"
				+ getTimezoneOffset(oDateTime),
			oDateTimeOffsetV2 = new DateTimeOffset(),
			oDateTimeOffsetAsDate = oDateTimeOffsetV2.parseValue(sFormattedDateTime, "string");

		assert.strictEqual(typeof sDateTimeOffset, "string");
		assert.strictEqual(sDateTimeOffsetParsed, sDateTimeOffsetWithPrecision);
		assert.strictEqual(sDateTimeOffsetFromObjectSource, sDateTimeOffsetWithPrecision);

		assert.ok(oDateTimeOffsetAsDate instanceof Date);

		assert.throws(function () {
				oDateTimeOffsetV4.validateValue(oDateTimeOffsetAsDate);
			}, new ValidateException("Illegal sap.ui.model.odata.type.DateTimeOffset value: "
				+ oDateTimeOffsetAsDate)
		);
		assert.throws(function () {
				oDateTimeOffsetV2.validateValue(sDateTimeOffset);
			}, new ValidateException("Illegal sap.ui.model.odata.type.DateTimeOffset value: "
				+ sDateTimeOffset)
		);
	});

	//*********************************************************************************************
	QUnit.test("V4 : true", function (assert) {
		var oDateTimeOffsetV4 = new DateTimeOffset(undefined, {V4 : true}),
			oModel = new JSONModel({
				DateTimeOffset : sDateTimeOffset
			}),
			oControl = new Control({
				models : oModel,
				tooltip : "{constraints : {V4 : true}, path : '/DateTimeOffset'"
					+ ", type : 'sap.ui.model.odata.type.DateTimeOffset'}"
			});

		assert.strictEqual(oControl.getTooltip(), sFormattedDateTime);

		oDateTimeOffsetV4.validateValue(sDateTimeOffset);
		oDateTimeOffsetV4.validateValue(sDateTimeOffsetYear0);

		oControl.getBinding("tooltip").getType().validateValue(sDateTimeOffset);

		oControl.destroy();
	});

	//*********************************************************************************************
	QUnit.test("V4: formatValue", function (assert) {
		var oDateTimeOffset = new DateTimeOffset(),
			oUI5DateMock = this.mock(UI5Date);

		oUI5DateMock.expects("getInstance").withExactArgs(2014, 10, 27, 13, 47, 26).returns("~newDate");

		assert.deepEqual(oDateTimeOffset.formatValue(oDateTimeUTC, "object"), "~newDate",
			"JS date-object can be formatted");
		// restore UI5Date mock as its getInstance is implicitly called within DateFormat#parse
		oUI5DateMock.restore();

		assert.deepEqual(oDateTimeOffset.formatValue("foo", "object"), null);
		assert.deepEqual(oDateTimeOffset.formatValue(undefined, "object"), null);
		assert.deepEqual(oDateTimeOffset.formatValue(null, "object"), null);
		assert.deepEqual(oDateTimeOffset.formatValue("", "object"), null);
		assert.strictEqual(oDateTimeOffset.formatValue(sDateTimeOffset, "string"),
			sFormattedDateTime, "V4 values can be formatted");
		assert.strictEqual(oDateTimeOffset.formatValue("2014-11-27T12:47:26Z", "any"),
			"2014-11-27T12:47:26Z", "V4 values parsed only when needed");

		assert.throws(function () {
			// strict parsing, February does not have 30 days!
			oDateTimeOffset.formatValue("2000-02-30T00:00:00Z", "string");
		}, new FormatException(
			"Illegal sap.ui.model.odata.type.DateTimeOffset value: 2000-02-30T00:00:00Z"));
		// Note: We support duck typing! If it is not a string, it must have getTime()...

		this.mock(oDateTimeOffset).expects("getPrimitiveType").thrice().
			withExactArgs("sap.ui.core.CSSSize").returns("string");
		assert.strictEqual(oDateTimeOffset.formatValue(sDateTimeOffset, "sap.ui.core.CSSSize"),
				sFormattedDateTime);

		oDateTimeOffset = new DateTimeOffset({}, {precision : 3});
		// TODO DateFormat only supports split seconds using a locale-dependent pattern
		assert.strictEqual(oDateTimeOffset.formatValue(sDateTimeOffsetWithMS, "string"),
			sFormattedDateTime, "V4 value with milliseconds accepted");

		// TODO why does DateTime.parse fail on unexpected milliseconds when the timezone is an
		// offset, but not when it is "Z"?
//		oDateTimeOffset = new DateTimeOffset({precision : 0});
//		assert.throws(function () {
//			oDateTimeOffset.formatValue(sDateTimeOffsetWithMS, "string");
//		}, new FormatException(
//			"Illegal sap.ui.model.odata.type.DateTimeOffset value: " + sDateTimeOffsetWithMS));
	});

	//*********************************************************************************************
	QUnit.test("V4: validateValue", function (assert) {
		var oDateTimeOffset0 = new DateTimeOffset().setV4(),
			oDateTimeOffset12 = new DateTimeOffset(undefined, {precision : 12}).setV4();

		function throws(oDateTimeOffset, sValue) {
			assert.throws(function () {
					oDateTimeOffset.validateValue(sValue);
				}, new ValidateException("Illegal sap.ui.model.odata.type.DateTimeOffset value: "
					+ sValue)
			);
		}

		oDateTimeOffset0.validateValue("2000-01-01T16:00:00Z");
		throws(oDateTimeOffset0, "2000-01-01T16:00:00.0Z");
		throws(oDateTimeOffset0, undefined);

		// @see _AnnotationHelperExpression.qunit.js
		[
			"2000-01-01T16:00Z",
			"2000-01-01t16:00:00z",
			"2000-01-01T16:00:00.0Z",
			"2000-01-01T16:00:00.000Z",
			"2000-01-02T01:00:00.000+09:00",
			"2000-01-02T06:00:00.000+14:00", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
			"2000-01-01T16:00:00.000456789012Z"
		].forEach(function (sValue) {
			oDateTimeOffset12.validateValue(sValue);
		});
		[
			"2000-01-01",
			"2000-01-01T16:00GMT", // valid in RFC 822, but not here
			"2000-01-32T16:00:00.000Z",
			"2000-01-01T16:00:00.1234567890123Z",
			"2000-01-01T16:00:00.000+14:01", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
			"2000-01-01T16:00:00.000+00:60",
			"2000-01-01T16:00:00.000~00:00",
			"2000-01-01T16:00:00.Z",
			// Note: negative year values not supported at SAP
			"-0006-12-24T00:00:00Z",
			"-6-12-24T16:00:00Z"
		].forEach(function (sValue) {
			throws(oDateTimeOffset12, sValue);
		});
	});

	//*********************************************************************************************
	QUnit.test("V4: format option UTC", function (assert) {
		var oType = new DateTimeOffset({UTC : true}, {V4 : true}),
			sDateTime = "2014-11-27T13:47:26Z",
			sFormattedDateTime = "Nov 27, 2014, 1:47:26\u202FPM",
			oFormattedDateTime = UI5Date.getInstance(Date.UTC(2014, 10, 27, 13, 47, 26));

		oType._resetModelFormatter();
		this.mock(DateFormat).expects("getDateInstance") // getModelFormatter
			.withExactArgs({
				calendarType : CalendarType.Gregorian,
				pattern : "yyyy-MM-dd'T'HH:mm:ssXXX",
				strictParsing : true,
				UTC : oType.oFormatOptions && oType.oFormatOptions.UTC
			})
			.callThrough();

		assert.strictEqual(oType.formatValue(sDateTime, "string"), sFormattedDateTime);
		assert.strictEqual(oType.parseValue(sFormattedDateTime, "string"), sDateTime);

		assert.deepEqual(oType.formatValue(sDateTime, "object"), oFormattedDateTime);
		assert.deepEqual(oType.parseValue(oFormattedDateTime, "object"), sDateTime);
	});

	//*********************************************************************************************
	QUnit.test("V4: getModelFormat uses Gregorian calendar type", function (assert) {
		var oFormat,
			oParsedDate,
			oType = new DateTimeOffset(undefined, {precision : 3}).setV4();

		Formatting.setCalendarType(CalendarType.Japanese);
		oType._resetModelFormatter();

		// code under test
		oFormat = oType.getModelFormat();

		oParsedDate = oFormat.parse(sDateTimeOffsetWithMS);
		assert.ok(oParsedDate instanceof Date, "parse delivers a Date");
		assert.strictEqual(oParsedDate.getTime(), oDateTimeWithMS.getTime(), "parse value");
		assert.strictEqual(oFormat.format(oParsedDate), sDateTimeOffsetWithMS, "format");
		assert.strictEqual(oFormat.oFormatOptions.calendarType, CalendarType.Gregorian);
	});

	//*********************************************************************************************
	QUnit.test("_resetModelFormatter", function (assert) {
		var oType = new DateTimeOffset().setV4(),
			oFormat = oType.getModelFormat();

		assert.strictEqual(oFormat, oType.getModelFormat());

		// code under test
		oType._resetModelFormatter();

		assert.notStrictEqual(oFormat, oType.getModelFormat());
	});

	//*********************************************************************************************
	QUnit.test("getModelValue", function (assert) {
		var oFormat = {format : function () {}},
			oType = new DateTimeOffset(),
			oTypeMock = this.mock(oType);

		oTypeMock.expects("_getModelValue").withExactArgs("~date").returns("~result");
		oTypeMock.expects("validateValue").withExactArgs("~result");

		// code under test
		assert.strictEqual(oType.getModelValue("~date"), "~result");

		oType = new DateTimeOffset().setV4();
		oTypeMock = this.mock(oType);

		oTypeMock.expects("_getModelValue").withExactArgs("~date").returns("~result0");
		oTypeMock.expects("getModelFormat").withExactArgs().returns(oFormat);
		this.mock(oFormat).expects("format").withExactArgs("~result0").returns("~result1");
		oTypeMock.expects("validateValue").withExactArgs("~result1");

		// code under test
		assert.strictEqual(oType.getModelValue("~date"), "~result1");

		oTypeMock.expects("_getModelValue").withExactArgs(null).returns(null);
		oTypeMock.expects("validateValue").withExactArgs(null);

		// code under test
		assert.strictEqual(oType.getModelValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: integrative test", function (assert) {
		var sResult,
			oInput = UI5Date.getInstance(2022, 11, 31, 8, 7, 6),
			oType = new DateTimeOffset().setV4();

		sResult = oType.parseValue(DateFormat.getDateTimeInstance().format(oInput), "string");

		// code under test: V4=true, UTC=false
		assert.deepEqual(oType.getModelValue(oInput), sResult);

		oType = new DateTimeOffset({UTC : true}).setV4();
		sResult = oType.parseValue(DateFormat.getDateTimeInstance().format(oInput), "string");

		// code under test: V4=true UTC=true
		assert.deepEqual(oType.getModelValue(oInput), sResult);
	});

	//*********************************************************************************************
[{
	UTC: false,
	initialDate: "2022-06-30T08:07:06",
	expectedDateValue: "2022-06-30T08:07:06",
	expectedModelValue: "2022-06-30T08:07:06"
}, {
	UTC: {UTC: true},
	initialDate: "2022-06-30T08:07:06",
	expectedDateValue: "2022-06-30T08:07:06",
	expectedModelValue: "2022-06-30T08:07:06Z"
}].forEach(function (oFixture, i) {
	QUnit.test("Integrative test getModelValue/getDateValue " + i, function (assert) {
		var oDateValue, sModelValue,
			oType = new DateTimeOffset({UTC: oFixture.UTC}).setV4();

		function trimLocalOffset() {
			// non-UTC maybe uses a local "+offset" style; remove local offset to compare local dates independent of
			// the current time zone;
			// e.g. local "2022-06-30T08:07:06" becomes "2022-06-30T08:07:06+02:00" instead of "2022-06-30T06:07:06Z"
			if (!oFixture.UTC) {
				sModelValue = sModelValue.replace(/[+-]\d{2}:\d{2}$/, "");
			}
		}

		// code under test
		sModelValue = oType.getModelValue(UI5Date.getInstance(oFixture.initialDate));

		trimLocalOffset();
		assert.strictEqual(sModelValue, oFixture.expectedModelValue);

		// code under test
		oDateValue = oType.getDateValue(sModelValue);

		assert.deepEqual(oDateValue, UI5Date.getInstance(oFixture.expectedDateValue));

		// code under test
		sModelValue = oType.getModelValue(oDateValue);

		trimLocalOffset();
		assert.strictEqual(sModelValue, oFixture.expectedModelValue);
	});
});

	//*********************************************************************************************
[new DateTimeOffset(), new DateTimeOffset().setV4()].forEach(function (oType, i) {
	QUnit.test("getISOStringFromModelValue: falsy values " + i, function (assert) {
		assert.strictEqual(oType.getISOStringFromModelValue(null), null);
		assert.strictEqual(oType.getISOStringFromModelValue(undefined), null);
		if (oType.bV4) {
			assert.strictEqual(oType.getISOStringFromModelValue(""), null);
		}
	});
});

	//*********************************************************************************************
	QUnit.test("getModelValueFromISOString for V2", function (assert) {
		this.mock(UI5Date).expects("getInstance").withExactArgs("~sISOString").returns("~oDate");

		assert.deepEqual(new DateTimeOffset().getModelValueFromISOString("~sISOString"), "~oDate");
	});

	//*********************************************************************************************
[{
		sDateString: "2023-07-31T09:15:30Z",
		sISOString: "2023-07-31T09:15:30.000Z",
		sExpectedISOString: "2023-07-31T09:15:30.000Z"
}, {
		sDateString: "0099-09-25T12:30:45.123Z",
		sISOString: "0099-09-25T12:30:45.123Z",
		sExpectedISOString: "0099-09-25T12:30:45.123Z"
}, {
		sDateString: "0009-06-30T00:00:00.123Z",
		sISOString: "0009-06-29T23:00:00.123-01:00",
		sExpectedISOString: "0009-06-30T00:00:00.123Z"
}, {
		sDateString: "2022-06-30T09:15:45.1Z",
		sISOString: "2022-06-30T10:15:45.1+01:00",
		sExpectedISOString: "2022-06-30T09:15:45.100Z"
}].forEach(function (oFixture, i) {
	QUnit.test("getISOStringFromModelValue/getModelValueFromISOString: integrative test V2 #" + i, function (assert) {
		var oDate = UI5Date.getInstance(oFixture.sDateString),
			oType = new DateTimeOffset();

		assert.strictEqual(oType.getISOStringFromModelValue(oDate), oFixture.sExpectedISOString);
		assert.deepEqual(oType.getModelValueFromISOString(oFixture.sISOString), oDate);
	});
});

	//*********************************************************************************************
	QUnit.test("getISOStringFromModelValue: integrative test V4", function (assert) {
		assert.strictEqual(new DateTimeOffset({}, {V4: true})
			.getISOStringFromModelValue("2023-07-31T09:15:30Z"), "2023-07-31T09:15:30Z");
	});

	//*********************************************************************************************
[new DateTimeOffset(), new DateTimeOffset().setV4()].forEach(function (oType, i) {
	QUnit.test("getModelValueFromISOString: falsy values " + i, function (assert) {
		assert.strictEqual(oType.getModelValueFromISOString(null), null);
		assert.strictEqual(oType.getModelValueFromISOString(undefined), null);
		assert.strictEqual(oType.getModelValueFromISOString(""), null);
	});
});

	//*********************************************************************************************
	// Enhance existing integration test for V4 DateTimeOffset#getModelValueFromISOString with and without precision
	// constraints. It is expected that the milliseconds in the ISO string are either truncated or padded with 0
	// according to the set precision.
	// BCP: 2380114882
[{
	sISOString: "2023-01-31T23:15:30.6Z",
	sModelValue: "2023-01-31T23:15:30.6Z",
	iPrecision: 1
}, {
	sISOString: "2023-07-31T09:15:30.123Z",
	sModelValue: "2023-07-31T09:15:30.12Z",
	iPrecision: 2
}, {
	sISOString: "2023-07-31T09:15:30.12Z",
	sModelValue: "2023-07-31T09:15:30.1200Z",
	iPrecision: 4
}, {
	sISOString: "2023-07-31T09:15:30.12Z",
	sModelValue: "2023-07-31T09:15:30Z",
	iPrecision: undefined
}].forEach(function (oFixture, i) {
	QUnit.test("getModelValueFromISOString: integrative test #" + i, function (assert) {
		const oType = new DateTimeOffset({}, {V4: true, precision: oFixture.iPrecision});

		// code under test
		assert.strictEqual(oType.getModelValueFromISOString(oFixture.sISOString), oFixture.sModelValue);
	});
});
});