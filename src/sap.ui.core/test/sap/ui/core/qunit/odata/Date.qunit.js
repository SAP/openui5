/*!
 *{copyright}
 */
sap.ui.require([
	"sap/ui/core/format/DateFormat", "sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/ODataType"
], function (DateFormat, DateType, ODataType) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	/*
	 * Tests whether the given value throws a ParseException.
	 */
	function parseError(assert, oType, oValue, sReason) {
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue(oValue, "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof sap.ui.model.ParseException, sReason + ": exception");
				assert.strictEqual(e.message, "EnterDate Nov 27, 2014", sReason + ": message");
			}
		});
	}

	/*
	 * Tests whether the given value throws a ValidateException.
	 */
	function validateError(assert, oType, oValue, sReason) {
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			try {
				oType.validateValue(oValue);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof sap.ui.model.ValidateException, sReason + ": exception");
				assert.strictEqual(e.message, "EnterDate Nov 27, 2014", sReason + ": message");
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Date", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new DateType();

		assert.ok(oType instanceof DateType, "is a Date");
		assert.ok(oType instanceof ODataType, "is a ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Date", "type name");
		assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
		assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	["false", false, "true", true, undefined].forEach(function (vNullable, i) {
		QUnit.test("with nullable=" + vNullable + " (type: " + typeof vNullable + ")",
			function (assert) {
				var oType;

				this.mock(jQuery.sap.log).expects("warning").never();

				oType = new DateType({}, {
					foo: "a",
					nullable: vNullable
				});
				assert.deepEqual(oType.oConstraints, i >= 2 ? undefined : {nullable: false});
			});
	});

	//*********************************************************************************************
	QUnit.test("default nullable is true", function (assert) {
		var oType;

		this.mock(jQuery.sap.log).expects("warning")
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Date");

		oType = new DateType(null, {nullable: "foo"});
		assert.deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
	});

	//*********************************************************************************************
	[
		{i: undefined, o: null},
		{i: null, o: null},
		{i: "foo", t: "any", o: "foo"},
		{i: "2014-11-27", t: "string", o: "Nov 27, 2014"}
	].forEach(function (oFixture) {
		QUnit.test("format value", function (assert) {
			var oType = new DateType();
			assert.deepEqual(oType.formatValue(oFixture.i, oFixture.t), oFixture.o, oFixture.i);
		});
	});

	//*********************************************************************************************
	QUnit.test("format value (error cases)", function (assert) {
		var oType = new DateType();

		["int", "float", "boolean"].forEach(function (sType) {
			try {
				oType.formatValue("2015-12-24", sType);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof sap.ui.model.FormatException);
				assert.strictEqual(e.message,
					"Don't know how to format sap.ui.model.odata.type.Date to " + sType);
			}
		});
	});


	//*********************************************************************************************
	[
		{oOptions: {},  oExpected: { strictParsing : true, UTC : true}},
		{oOptions: undefined, oExpected: {strictParsing: true, UTC: true}},
		{oOptions: {strictParsing: false}, oExpected: {strictParsing: false, UTC: true}},
		{oOptions: {foo: "bar"}, oExpected: {strictParsing: true, foo: "bar", UTC: true}},
		{oOptions: {style: "medium"},
			oExpected: {strictParsing: true, style: "medium", UTC: true}},
		{oOptions: {strictParsing: false, UTC: false},
			oExpected: {strictParsing: false, UTC: true}}
	].forEach(function (oFixture) {
		QUnit.test("formatOptions=" + JSON.stringify(oFixture.oOptions), function (assert) {
			var oSpy = this.spy(DateFormat, "getDateInstance"),
				oType = new DateType(oFixture.oOptions);

			assert.strictEqual(oSpy.callCount, 0, "no formatter yet");
			assert.deepEqual(oType.oFormatOptions, oFixture.oOptions,
					"format options: " + JSON.stringify(oFixture.oOptions) + " set");

			// first call
			oType.formatValue("2015-12-24", "string");
			assert.strictEqual(oSpy.callCount, 1, "first format causes creation of the formatter");
			assert.ok(oSpy.calledWithExactly(oFixture.oExpected));

			// second call
			oType.formatValue("2015-12-25", "string");
			assert.strictEqual(oSpy.callCount, 1, "no further creation of a formatter");
		});
	});

	//*********************************************************************************************
	QUnit.test("parse Date", function (assert) {
		var oType = new DateType();

		assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
		assert.deepEqual(oType.parseValue("Nov 1, 715", "string"), "0715-11-01", "valid date");

		["int", "float", "boolean"].forEach(function (sType) {
			try {
				oType.parseValue("foo", sType);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof sap.ui.model.ParseException, sType + ": exception");
				assert.strictEqual(e.message,
					"Don't know how to parse " + oType.getName() + " from " + sType,
					sType + ": message");
			}
		});

		parseError(assert, oType, "foo", "not a date");
		parseError(assert, oType, "Feb 29, 2015", "invalid date");
	});

	//*********************************************************************************************
	QUnit.test("validate Date", function (assert) {
		var oConstraints = {},
			oType = new DateType();

		oType.validateValue(null);

		oConstraints.nullable = false;
		oType = new DateType({}, oConstraints);

		validateError(assert, oType, null, "nullable: false");

		try {
			oType.validateValue("foo");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof sap.ui.model.ValidateException);
			assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: foo");
		}

		try {
			oType.validateValue(["0715-11-01"]);
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof sap.ui.model.ValidateException);
			assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: 0715-11-01");
		}

		oType.validateValue("0715-11-01");
	});

	//*********************************************************************************************
	QUnit.test("format, parse, validate (DateTime)", function (assert) {
		var oType = new DateType({pattern : "dd.MMM.yyyy"}),
		sFormattedDate = oType.formatValue("0715-11-01", "string"),
		sResultingDate = oType.parseValue(sFormattedDate, "string");

		oType.validateValue(sResultingDate);
		assert.deepEqual(sResultingDate, "0715-11-01", "format and parse did not change the date");
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new sap.ui.core.Control(),
			oType = new DateType();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		assert.strictEqual(oType.formatValue("0715-11-01", "string"), "Nov 1, 715");
		sap.ui.getCore().getConfiguration().setLanguage("de-DE");
		assert.strictEqual(oType.formatValue("0715-11-01", "string"), "01.11.715",
			"adjusted to changed language");
	});
});
