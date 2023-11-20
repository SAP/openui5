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
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function(Log, Formatting, Localization, CalendarType, Control, UI5Date, DateFormat, FormatException, ParseException, ValidateException, DateType, ODataType, TestUtils) {
	/*global QUnit */
	/*eslint no-warning-comments: 0 */ //no ESLint warning for TODO list
	"use strict";

	/*
	 * Tests whether the given value causes a validation or parse exception to be thrown,
	 * depending on sAction.
	 * @param {string} sAction
	 *   validateValue to check for a validate exception
	 *   parseValue to check for a parse exception
	 */
	function checkError(assert, oType, oValue, sReason, sAction) {
		var fnExpectedException;

		TestUtils.withNormalizedMessages(function () {
			try {
				if (sAction === "parseValue") {
					fnExpectedException = ParseException;
					oType[sAction](oValue, "string");
				} else if (sAction === "validateValue") {
					fnExpectedException = ValidateException;
					oType[sAction](oValue);
				}
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof fnExpectedException, sReason + ": exception");
				assert.strictEqual(e.message, "EnterDate Dec 31, " + UI5Date.getInstance().getFullYear(),
					sReason + ": message");
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Date", {
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
		var oType = new DateType();

		assert.ok(oType instanceof DateType, "is a Date");
		assert.ok(oType instanceof ODataType, "is a ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Date", "type name");
		assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
		assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
		assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
		function (assert) {
			var oType = new DateType(null, null);

			assert.deepEqual(oType.oFormatOptions, null, "no format options");
			assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	["false", false, "true", true, undefined].forEach(function (vNullable, i) {
		QUnit.test("with nullable=" + vNullable + " (type: " + typeof vNullable + ")",
			function (assert) {
				var oType;

				oType = new DateType({}, {
					foo : "a",
					nullable : vNullable
				});
				assert.deepEqual(oType.oConstraints, i >= 2 ? undefined : {nullable : false});
			});
	});

	//*********************************************************************************************
	QUnit.test("default nullable is true", function (assert) {
		var oType;

		this.oLogMock.expects("warning")
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Date");

		oType = new DateType(null, {nullable : "foo"});
		assert.deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
	});

	//*********************************************************************************************
	QUnit.test("format value", function (assert) {
		[
			{i : undefined, o : null},
			{i : null, o : null},
			{i : "foo", t : "any", o : "foo"},
			{i : "2014-11-27", t : "string", o : "Nov 27, 2014"},
			{i : "2014-11-34", t : "string", o : "2014-11-34"},
			{i : UI5Date.getInstance(Date.UTC(2014, 10, 27)), t : "string", o : "Nov 27, 2014"},
			{i : "2014-11-27", t : "object", o : UI5Date.getInstance(2014, 10, 27)},
			{i : UI5Date.getInstance(Date.UTC(2014, 10, 27)), t : "object", o : UI5Date.getInstance(2014, 10, 27)}
		].forEach(function (oFixture) {
			var oType = new DateType();
			assert.deepEqual(oType.formatValue(oFixture.i, oFixture.t), oFixture.o, oFixture.i);
		});
	});

	//*********************************************************************************************
	QUnit.test("format value uses UI5Date", function (assert) {
		var oDate = UI5Date.getInstance(Date.UTC(2014, 10, 27)),
			oType = new DateType();

		this.mock(UI5Date).expects("getInstance").withExactArgs(2014, 10, 27).returns("~ui5Date");

		assert.strictEqual(oType.formatValue(oDate, "object"), "~ui5Date");
	});

	//*********************************************************************************************
	QUnit.test("format value, get primitive type", function (assert) {
		var oType = new DateType();

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.formatValue("2014-11-27", "sap.ui.core.CSSSize"), "Nov 27, 2014");
	});

	//*********************************************************************************************
	QUnit.test("format value (error cases)", function (assert) {
		var oType = new DateType();

		["int", "float", "boolean"].forEach(function (sType) {
			try {
				oType.formatValue("2015-12-24", sType);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message,
					"Don't know how to format sap.ui.model.odata.type.Date to " + sType);
			}
		});
	});

	//*********************************************************************************************
	[
		{oOptions : {},  oExpected : { strictParsing : true, UTC : true}},
		{oOptions : undefined, oExpected : {strictParsing : true, UTC : true}},
		{oOptions : {strictParsing : false}, oExpected : {strictParsing : false, UTC : true}},
		{oOptions : {foo : "bar"}, oExpected : {strictParsing : true, foo : "bar", UTC : true}},
		{oOptions : {style : "medium"},
			oExpected : {strictParsing : true, style : "medium", UTC : true}},
		{oOptions : {strictParsing : false, UTC : false},
			oExpected : {strictParsing : false, UTC : true}}
	].forEach(function (oFixture) {
		QUnit.test("formatOptions=" + JSON.stringify(oFixture.oOptions), function (assert) {
			var oDateFormatMock = this.mock(DateFormat),
				oType = new DateType(oFixture.oOptions);

			assert.deepEqual(oType.oFormatOptions, oFixture.oOptions,
				"format options: " + JSON.stringify(oFixture.oOptions) + " set");

			DateType._resetModelFormatter();
			oDateFormatMock.expects("getDateInstance") // getModelFormatter
				.withExactArgs({
					calendarType : CalendarType.Gregorian,
					pattern : 'yyyy-MM-dd',
					strictParsing : true,
					UTC : true
				})
				.callThrough();
			oDateFormatMock.expects("getDateInstance") // getFormatter
				.withExactArgs(oFixture.oExpected)
				.callThrough();

			// first call
			oType.formatValue("2015-12-24", "string");

			// second call - reuse formatters
			oType.formatValue("2015-12-25", "string");
		});
	});

	//*********************************************************************************************
	QUnit.test("parse value", function (assert) {
		var oType = new DateType();

		assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
		assert.deepEqual(oType.parseValue("Nov 1, 715", "string"), "0715-11-01", "valid date");
		assert.deepEqual(oType.parseValue(UI5Date.getInstance(2014, 9, 27), "object"), "2014-10-27");

		["int", "float", "boolean"].forEach(function (sType) {
			try {
				oType.parseValue("foo", sType);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ParseException, sType + ": exception");
				assert.strictEqual(e.message,
					"Don't know how to parse " + oType.getName() + " from " + sType,
					sType + ": message");
			}
		});

		checkError(assert, oType, "foo", "not a date", "parseValue");
		checkError(assert, oType, "Feb 29, 2015", "invalid date", "parseValue");

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.parseValue("Nov 27, 2014", "sap.ui.core.CSSSize"), "2014-11-27");
	});

	//*********************************************************************************************
	QUnit.test("validate Date", function (assert) {
		var oConstraints = {},
			oType = new DateType();

		oType.validateValue(null);

		oConstraints.nullable = false;
		oType = new DateType({}, oConstraints);

		checkError(assert, oType, null, "nullable: false", "validateValue");

		try {
			oType.validateValue("foo");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ValidateException);
			assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: foo");
		}

		try {
			oType.validateValue(["0715-11-01"]);
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ValidateException);
			assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: 0715-11-01");
		}

		oType.validateValue("0715-11-01");
	});

	//*********************************************************************************************
	QUnit.test("format, parse, validate", function (assert) {
		var oType = new DateType({pattern : "dd.MMM.yyyy"}),
			sFormattedDate = oType.formatValue("0715-11-01", "string"),
			sResultingDate = oType.parseValue(sFormattedDate, "string");

		oType.validateValue(sResultingDate);
		assert.deepEqual(sResultingDate, "0715-11-01", "format and parse did not change the date");
	});

	//*********************************************************************************************
	QUnit.test("format, parse, validate with target type object", function (assert) {
		var oType = new DateType({pattern : "dd.MMM.yyyy"}),
			sFormattedDate = oType.formatValue("0715-11-01", "object"),
			sResultingDate = oType.parseValue(sFormattedDate, "object");

		oType.validateValue(sResultingDate);
		assert.deepEqual(sResultingDate, "0715-11-01", "format and parse did not change the date");
	});

	//*********************************************************************************************
	QUnit.test("getModelFormat() uses Gregorian calendar type", function (assert) {
		var oFormat,
			sModelValue = "2015-11-27",
			oParsedDate;

		Formatting.setCalendarType(CalendarType.Japanese);
		DateType._resetModelFormatter();

		// code under test
		oFormat = new DateType().getModelFormat();

		oParsedDate = oFormat.parse(sModelValue);
		assert.ok(oParsedDate instanceof Date, "parse delivers a Date");
		assert.strictEqual(oParsedDate.getTime(), Date.UTC(2015, 10, 27), "parse value");
		assert.strictEqual(oFormat.format(oParsedDate), sModelValue, "format");
		assert.strictEqual(oFormat.oFormatOptions.calendarType, CalendarType.Gregorian);
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new DateType();

		oControl.bindProperty("tooltip", {path : "/unused", type : oType});
		assert.strictEqual(oType.formatValue("0715-11-01", "string"), "Nov 1, 715");
		Localization.setLanguage("de-DE");
		assert.strictEqual(oType.formatValue("0715-11-01", "string"), "01.11.715",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	QUnit.test("_resetModelFormatter", function (assert) {
		var oType = new DateType(),
			oFormat = oType.getModelFormat();

		assert.strictEqual(oFormat, oType.getModelFormat());

		// code under test
		DateType._resetModelFormatter();

		assert.notStrictEqual(oFormat, oType.getModelFormat());
	});

	//*********************************************************************************************
	QUnit.test("_getErrorMessage", function (assert) {
		var oDate = {getFullYear : function () {}},
			oType = new DateType();

		this.mock(UI5Date).expects("getInstance").withExactArgs().returns(oDate);
		this.mock(oDate).expects("getFullYear").withExactArgs().returns(2022);
		this.mock(oType).expects("formatValue").withExactArgs("2022-12-31", "string").returns("~formattedDate");

		TestUtils.withNormalizedMessages(function () {
			// code under test
			assert.strictEqual(oType._getErrorMessage(), "EnterDate ~formattedDate");
		});
	});

	//*********************************************************************************************
	QUnit.test("getModelValue", function (assert) {
		var oType = new DateType(),
			oTypeMock = this.mock(oType);

		oTypeMock.expects("validateValue").withExactArgs("0099-12-31");

		// code under test
		assert.strictEqual(oType.getModelValue(UI5Date.getInstance("0099-12-31T08:07:06")), "0099-12-31");

		oTypeMock.expects("validateValue").withExactArgs(null);

		// code under test
		assert.strictEqual(oType.getModelValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: checkDate fails", function (assert) {
		var oType = new DateType();

		this.mock(UI5Date).expects("checkDate").withExactArgs("~oDate").throws(new Error("~error"));

		// code under test
		assert.throws(function () {
			oType.getModelValue("~oDate");
		}, new Error("~error"));
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: validateValue fails", function (assert) {
		var oFormat = {format : function () {}},
			oType = new DateType();

		this.mock(oType).expects("getModelFormat").withExactArgs().returns(oFormat);
		this.mock(oFormat).expects("format")
			.withExactArgs(UI5Date.getInstance("0099-12-31T00:00:00Z"))
			.returns("~result");
		this.mock(oType).expects("validateValue").withExactArgs("~result").throws(new ValidateException("~error"));

		// code under test
		assert.throws(function () {
			oType.getModelValue(UI5Date.getInstance("0099-12-31T08:07:06"));
		}, new ValidateException("~error"));
	});

	//*********************************************************************************************
	QUnit.test("getDateValue", function (assert) {
		var oType = new DateType();

		this.mock(UI5Date).expects("getInstance").withExactArgs("~modelValueT00:00").returns("~result");

		// code under test
		assert.strictEqual(oType.getDateValue("~modelValue"), "~result");

		// code under test
		assert.strictEqual(oType.getDateValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("Integrative test getModelValue/getDateValue", function (assert) {
		var oDateValue, sModelValue,
			oType = new DateType();

		// code under test, the time added to the constructor, makes sure the created date is a local date
		sModelValue = oType.getModelValue(UI5Date.getInstance("0099-12-31T08:07:06"));

		assert.strictEqual(sModelValue, "0099-12-31");

		// code under test
		oDateValue = oType.getDateValue(sModelValue);

		// The time added to the constructor, makes sure the created date is a local date
		assert.deepEqual(oDateValue, UI5Date.getInstance("0099-12-31T00:00:00"));

		// code under test
		sModelValue = oType.getModelValue(oDateValue);

		assert.strictEqual(sModelValue, "0099-12-31");
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new DateType();

		this.mock(DateFormat.prototype).expects("getPlaceholderText").withExactArgs().callsFake(function () {
			assert.strictEqual(this, oType.oFormat);
			return "~placeholder";
		});

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.test("getFormat", function (assert) {
		var oType = new DateType();

		assert.strictEqual(oType.oFormat, undefined);

		// code under test
		var oResult = oType.getFormat();

		assert.ok(oResult instanceof DateFormat);
		assert.strictEqual(oType.oFormat, oResult);
	});

	//*********************************************************************************************
	QUnit.test("getISOStringFromModelValue/getModelValueFromISOString", function (assert) {
		var oType = new DateType();

		assert.strictEqual(oType.getISOStringFromModelValue("~Date"), "~Date");
		assert.strictEqual(oType.getModelValueFromISOString("~Date"), "~Date");
	});

	//*********************************************************************************************
["getISOStringFromModelValue", "getModelValueFromISOString"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": falsy values", function (assert) {
		var oType = new DateType();

		assert.strictEqual(oType[sMethod](null), null);
		assert.strictEqual(oType[sMethod](undefined), null);
		assert.strictEqual(oType[sMethod](""), null);
	});
});
});
