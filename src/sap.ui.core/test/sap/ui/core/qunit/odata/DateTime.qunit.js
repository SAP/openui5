/*!
 *{copyright}
 */
sap.ui.require([
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/DateTimeBase",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (Control, DateFormat, FormatException, ParseException, ValidateException, DateTime,
		DateTimeBase, ODataType, TestUtils) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oDateOnly = new Date(Date.UTC(2014, 10, 27, 0, 0, 0, 0)),
		oDateTime = new Date(2014, 10, 27, 13, 47, 26),
		sFormattedDateOnly = "Nov 27, 2014",
		sFormattedDateTime = "Nov 27, 2014, 1:47:26 PM",
		oMessages = {
			"EnterDateTime": "EnterDateTime Nov 27, 2014, 1:47:26 PM",
			"EnterDate": "EnterDate Nov 27, 2014"
		};

	function createInstance(sTypeName, oConstraints, oFormatOptions) {
		return new (jQuery.sap.getObject(sTypeName))(oFormatOptions, oConstraints);
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
	function validate(assert, sTypeName, oConstraints, sExpectedErrorKey) {
		var oType = createInstance(sTypeName, oConstraints);

		oType.validateValue(null);

		oConstraints.nullable = false;
		oType = createInstance(sTypeName, oConstraints);
		validateError(assert, oType, null, sExpectedErrorKey, "nullable");

		try {
			oType.validateValue("foo");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ValidateException);
			assert.strictEqual(e.message, "Illegal " + sTypeName + " value: foo");
		}
		oType.validateValue(new Date());
	}

	/*
	 * Tests that format and parse do not change the date and that validate accepts it.
	 */
	function formatParseValidate(assert, sTypeName, oConstraints, oTestDate) {
		var oType = createInstance(sTypeName, oConstraints),
			sFormattedDate = oType.formatValue(oTestDate, "string"),
			oResultingDate = oType.parseValue(sFormattedDate, "string");

		oType.validateValue(oResultingDate);
		assert.deepEqual(oResultingDate, oTestDate, "format and parse did not change the date");
	}

	//*********************************************************************************************
	function dateTime(sTypeName) {

		//*****************************************************************************************
		QUnit.test("basics", function (assert) {
			var oType = createInstance(sTypeName);

			assert.ok(oType instanceof DateTimeBase, "is a DateTime");
			assert.ok(oType instanceof ODataType, "is an ODataType");
			assert.strictEqual(oType.getName(), sTypeName, "type name");
			assert.strictEqual(oType.oFormatOptions, undefined, "format options ignored");
			assert.strictEqual(oType.oConstraints, undefined, "default constraints");
			assert.strictEqual(oType.oFormat, null, "no formatter preload");
		});

		//*****************************************************************************************
		QUnit.test("format (DateTime)", function (assert) {
			var oType = createInstance(sTypeName);

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
						"Don't know how to format " + sTypeName + " to " + sType);
				}
			});
		});

		//*****************************************************************************************
		QUnit.test("parse (DateTime)", function (assert) {
			var oType = createInstance(sTypeName);

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
						"Don't know how to parse " + sTypeName + " from " + sType,
						sType + ": message");
				}
			});

			parseError(assert, oType, "foo", "EnterDateTime", "not a date");
			parseError(assert, oType, "Feb 28, 2014, 11:69:30 AM", "EnterDateTime",
				"invalid time");
		});

		//*****************************************************************************************
		QUnit.test("validate (DateTime)", function (assert) {
			validate(assert, sTypeName, {}, "EnterDateTime");
		});

		//*****************************************************************************************
		QUnit.test("format, parse, validate (DateTime)", function (assert) {
			formatParseValidate(assert, sTypeName, {}, oDateTime);
		});

		//*****************************************************************************************
		QUnit.test("localization change", function (assert) {
			var oControl = new Control(),
				oType = createInstance(sTypeName);

			oControl.bindProperty("tooltip", {path: "/unused", type: oType});
			sap.ui.getCore().getConfiguration().setLanguage("de-DE");
			assert.strictEqual(oType.formatValue(oDateTime, "string"),
				DateFormat.getDateTimeInstance().format(oDateTime),
				"adjusted to changed language");
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.DateTime", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	dateTime("sap.ui.model.odata.type.DateTime");

	//*********************************************************************************************
	[
		{i: {}, o: undefined},
		{i: {nullable: true, displayFormat: "Date"}, o: {isDateOnly: true}},
		{i: {nullable: false, displayFormat: "foo"}, o: {nullable: false},
			warning: "Illegal displayFormat: foo"},
		{i: {nullable: "true", displayFormat: 1}, o: undefined,
			warning: "Illegal displayFormat: 1"},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"}
	].forEach(function (oFixture) {
		QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
			var oType = new DateTime();

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.DateTime");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType = new DateTime({}, oFixture.i);
			assert.deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	[
		{oFormatOptions: {},  oExpected: {strictParsing: true}},
		{oFormatOptions: undefined, oExpected: {strictParsing: true}},
		{oFormatOptions: {strictParsing: false, UTC: true}, oExpected: {strictParsing: false}},
		{oFormatOptions: {foo: "bar"}, oExpected: {strictParsing: true, foo: "bar"}},
		{oFormatOptions: {style: "medium"}, oExpected: {strictParsing: true, style: "medium"}},
		// with displayFormat = Date
		{oFormatOptions: {}, oConstraints: {displayFormat: "Date"},
			oExpected: {UTC: true, strictParsing: true}},
		{oFormatOptions: undefined, oConstraints: {displayFormat: "Date"},
			oExpected: {UTC: true, strictParsing: true}},
		{oFormatOptions: {strictParsing: false}, oConstraints: {displayFormat: "Date"},
			oExpected: {UTC: true, strictParsing: false}},
		{oFormatOptions: {foo: "bar"}, oConstraints: {displayFormat: "Date"},
			oExpected: {UTC: true, strictParsing: true, foo: "bar"}},
		{oFormatOptions: {UTC: false}, oConstraints: {displayFormat: "Date"},
			oExpected: {UTC: true, strictParsing: true}},
		{oFormatOptions: {style: "medium"}, oConstraints: {displayFormat: "Date"},
			oExpected: {UTC: true, strictParsing: true, style: "medium"}}
	].forEach(function (oFixture) {
		QUnit.test("formatOptions=" + JSON.stringify(oFixture.oFormatOptions),
			function (assert) {
					var oType = createInstance("sap.ui.model.odata.type.DateTime",
						oFixture.oConstraints, oFixture.oFormatOptions),
					oSpy = (oFixture.oConstraints) ?
						this.spy(sap.ui.core.format.DateFormat, "getDateInstance") :
						this.spy(sap.ui.core.format.DateFormat, "getDateTimeInstance");

				assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
					"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
				oType.formatValue(oDateTime, "string");
				assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
			});
	});

	//*********************************************************************************************
	QUnit.test("format and parse (Date)", function (assert) {
		var oType = new DateTime({}, {displayFormat: "Date"});

		assert.strictEqual(oType.formatValue(oDateOnly, "string"), sFormattedDateOnly,
			"target type string");
		assert.deepEqual(oType.parseValue(sFormattedDateOnly, "string"), oDateOnly);

		parseError(assert, oType, "Feb 30, 2014", "EnterDate", "invalid date");
	});

	//*********************************************************************************************
	QUnit.test("validate (Date)", function (assert) {
		validate(assert, "sap.ui.model.odata.type.DateTime", {displayFormat: "Date"}, "EnterDate");
	});

	//*********************************************************************************************
	QUnit.test("format, parse, validate (Date)", function (assert) {
		formatParseValidate(assert, "sap.ui.model.odata.type.DateTime", {displayFormat: "Date"},
			oDateOnly);
	});

	//*********************************************************************************************
	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.DateTimeOffset", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	dateTime("sap.ui.model.odata.type.DateTimeOffset");

	//*********************************************************************************************
	[
		{i: {}, o: undefined},
		{i: {nullable: true, displayFormat: "Date"}, o: undefined},
		{i: {nullable: false, isDateOnly: true}, o: {nullable: false}},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"}
	].forEach(function (oFixture) {
		QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
			var oType;

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null,
					"sap.ui.model.odata.type.DateTimeOffset");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType = new sap.ui.model.odata.type.DateTimeOffset({},  oFixture.i);
			assert.deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	[
		{oFormatOptions: {},  oExpected: {strictParsing: true}},
		{oFormatOptions: undefined, oExpected: {strictParsing: true}},
		{oFormatOptions: {strictParsing: false}, oExpected: {strictParsing: false}},
		{oFormatOptions: {foo: "bar"}, oExpected: {strictParsing: true, foo: "bar"}},
		{oFormatOptions: {style: "medium"}, oExpected: {strictParsing: true, style: "medium"}}
	].forEach(function (oFixture) {
		QUnit.test("formatOptions=" + JSON.stringify(oFixture.oFormatOptions),
			function (assert) {
					var oType = createInstance("sap.ui.model.odata.type.DateTimeOffset", {},
						oFixture.oFormatOptions),
					oSpy = this.spy(sap.ui.core.format.DateFormat, "getDateTimeInstance");

				assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
					"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
				oType.formatValue(oDateTime, "string");
				assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
			});
	});
});
