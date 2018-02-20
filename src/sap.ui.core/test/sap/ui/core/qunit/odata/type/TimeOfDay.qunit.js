/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/test/TestUtils"
], function (jQuery, Control, DateFormat, FormatException, ParseException, ValidateException,
		ODataType, TimeOfDay, TestUtils) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

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
					"EnterTime " + oType.formatValue("13:47:26", "string"));
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.TimeOfDay", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oFormatOptions = {},
			oType = new TimeOfDay(oFormatOptions);

		assert.ok(oType instanceof TimeOfDay, "is a TimeOfDay");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.TimeOfDay", "type name");
		assert.strictEqual(sap.ui.model.odata.type.TimeOfDay, TimeOfDay);
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
				var oSpy,
					oType;

				//code under test
				oType = new TimeOfDay(oFixture.oFormatOptions);

				assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
						"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");

				oSpy = this.spy(DateFormat, "getTimeInstance");

				//code under test
				oType.formatValue("13:53:49", "string");
				oType.formatValue("13:53:49", "string"); // test that formatter is created once

				assert.ok(oSpy.calledWithExactly({pattern : "HH:mm:ss", strictParsing : true,
					UTC : true}));
				assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
				assert.strictEqual(oSpy.callCount, 2);
			});
	});

	//*********************************************************************************************
	QUnit.test("formatValue success", function (assert) {
		var oType = new TimeOfDay(undefined, {precision : 7}),
			sValue = "13:53:49.1234567";

		assert.strictEqual(oType.formatValue(undefined, "foo"), null);
		assert.strictEqual(oType.formatValue(null, "foo"), null);

		assert.strictEqual(oType.formatValue(sValue, "any"), sValue);
		assert.strictEqual(oType.formatValue(sValue, "string"), "1:53:49 PM");

		assert.strictEqual(oType.formatValue("13:53:49", "string"), "1:53:49 PM");

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.formatValue(sValue, "sap.ui.core.CSSSize"), "1:53:49 PM");
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
		var oType = new TimeOfDay(),
			oTypePrecision = new TimeOfDay({pattern : "HH:mm:ss.SSS a"}, {precision : 5});

		assert.strictEqual(oType.parseValue(null, "string"), null);
		assert.strictEqual(oType.parseValue("", "string"), null);

		assert.strictEqual(oType.parseValue("1:53:49 PM", "string"), "13:53:49");
		assert.strictEqual(oTypePrecision.parseValue("1:53:49.123 PM", "string"), "13:53:49.12300");

		parseError(assert, oType, "foo");
		parseError(assert, oType, "1:69:30 AM");

		sap.ui.getCore().getConfiguration().setLanguage("de");
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
				new ValidateException("EnterTime 1:47:26 PM"));
		});
	});

	//*********************************************************************************************
	QUnit.test("getModelFormat()", function (assert) {
		var oType = new TimeOfDay(undefined, {precision : 3}),
			oFormat = oType.getModelFormat(),
			sModelValue = "13:53:49.123",
			oParsedTimeOfDay = oFormat.parse(sModelValue);

		assert.ok(oParsedTimeOfDay instanceof Date, "parse delivers a Date");
		assert.strictEqual(oParsedTimeOfDay.getTime(), Date.UTC(1970, 0, 1, 13, 53, 49, 123),
			"parse value");
		assert.strictEqual(oFormat.format(oParsedTimeOfDay), sModelValue, "format");
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new TimeOfDay(),
			sValue = "13:53:49";

		oControl.bindProperty("tooltip", {path : "/unused", type : oType});
		oType.formatValue(sValue, "string"); // ensure that a formatter exists
		sap.ui.getCore().getConfiguration().setLanguage("de");
		assert.strictEqual(oType.formatValue(sValue, "string"), sValue,
			"adjusted to changed language");
	});
});
