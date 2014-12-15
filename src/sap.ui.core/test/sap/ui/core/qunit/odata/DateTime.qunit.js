/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.core.Control");
	jQuery.sap.require("sap.ui.core.format.DateFormat");

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oDateOnly = new Date(),
		oDateTime = new Date(2014, 10, 27, 13, 47, 26),
		sFormattedDateOnly = "Nov 27, 2014",
		sFormattedDateTime = "Nov 27, 2014, 1:47:26 PM",
		oMessages = {
			"EnterDateTime": "Enter a date and a time (like Nov 27, 2014, 1:47:26 PM).",
			"EnterDate": "Enter a date (like Nov 27, 2014)."
		};

	oDateOnly.setUTCFullYear(2014);
	oDateOnly.setUTCMonth(10);
	oDateOnly.setUTCDate(27);
	oDateOnly.setUTCHours(0);
	oDateOnly.setUTCMinutes(0);
	oDateOnly.setUTCSeconds(0);
	oDateOnly.setUTCMilliseconds(0);

	function createInstance(sTypeName, oConstraints) {
		return new (jQuery.sap.getObject(sTypeName))({}, oConstraints);
	}

	/*
	 * Tests that the given value leads to a ParseException.
	 */
	function parseError(oType, oValue, sExpectedErrorKey, sReason) {
		sinon.test(function () {
			this.spy(sap.ui.getCore().getLibraryResourceBundle(), "getText");
			try {
				oType.parseValue(oValue, "string");
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ParseException, sReason + ": exception");
				strictEqual(e.message, oMessages[sExpectedErrorKey], sReason + ": message");
			}
			sinon.assert.calledWith(sap.ui.getCore().getLibraryResourceBundle().getText,
				sExpectedErrorKey);
		}).apply({}); // give sinon.test a this to enrich
	}

	/*
	 * Tests that the given value leads to a ValidateException.
	 */
	function validateError(oType, oValue, sExpectedErrorKey, sReason) {
		sinon.test(function () {
			this.spy(sap.ui.getCore().getLibraryResourceBundle(), "getText");
			try {
				oType.validateValue(oValue);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException, sReason + ": exception");
				strictEqual(e.message, oMessages[sExpectedErrorKey], sReason + ": message");
			}
			sinon.assert.calledWith(sap.ui.getCore().getLibraryResourceBundle().getText,
				sExpectedErrorKey);
		}).apply({}); // give sinon.test a this to enrich
	}

	/*
	 * Tests the validation for a DateTime with the given constraints.
	 */
	function validate(sTypeName, oConstraints, sExpectedErrorKey) {
		var oType = createInstance(sTypeName, oConstraints);

		oType.validateValue(null);

		oConstraints.nullable = false;
		oType.setConstraints(oConstraints);
		validateError(oType, null, sExpectedErrorKey, "nullable");

		try {
			oType.validateValue("foo");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message, "Illegal " + sTypeName + " value: foo");
		}
		oType.validateValue(new Date());
	}

	/**
	 * Tests that format and parse do not change the date and that validate accepts it.
	 */
	function formatParseValidate(sTypeName, oConstraints, oTestDate) {
		var oType = createInstance(sTypeName, oConstraints),
			sFormattedDate = oType.formatValue(oTestDate, "string"),
			oResultingDate = oType.parseValue(sFormattedDate, "string");

		oType.validateValue(oResultingDate);
		deepEqual(oResultingDate, oTestDate, "format and parse did not change the date");
	}

	//*********************************************************************************************
	function dateTime(sTypeName) {

		//*****************************************************************************************
		test("basics", function () {
			var oDefaultConstraints = undefined,
				oType = createInstance(sTypeName);

			ok(oType instanceof sap.ui.model.odata.type.DateTimeBase, "is a DateTime");
			ok(oType instanceof sap.ui.model.SimpleType, "is a SimpleType");
			strictEqual(oType.getName(), sTypeName, "type name");
			deepEqual(oType.oConstraints, oDefaultConstraints, "default constraints");
			strictEqual(oType.oFormat, null, "no formatter preload");

			oType.setFormatOptions({foo: "bar"});
			strictEqual(oType.oFormatOptions, undefined, "format options ignored");

			oType.setConstraints();
			deepEqual(oType.oConstraints, oDefaultConstraints, "default constraints");
		});

		//*****************************************************************************************
		test("format (DateTime)", function () {
			var oType = createInstance(sTypeName);

			strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
			strictEqual(oType.formatValue(null, "foo"), null, "null");
			strictEqual(oType.formatValue(oDateTime, "any"), oDateTime, "target type any");
			strictEqual(oType.formatValue(oDateTime, "string"), sFormattedDateTime,
				"target type string");
			jQuery.each(["int", "float", "boolean"], function (i, sType) {
				try {
					oType.formatValue(oDateTime, sType);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.FormatException);
					strictEqual(e.message,
						"Don't know how to format " + sTypeName + " to " + sType);
				}
			});
		});

		//*****************************************************************************************
		test("parse (DateTime)", function () {
			var oType = createInstance(sTypeName);

			strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
			strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
			deepEqual(oType.parseValue(sFormattedDateTime, "string"), oDateTime);

			jQuery.each(["int", "float", "boolean"], function (i, sType) {
				try {
					oType.parseValue(sFormattedDateTime, sType);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ParseException, sType + ": exception");
					strictEqual(e.message,
						"Don't know how to parse " + sTypeName + " from " + sType,
						sType + ": message");
				}
			});

			parseError(oType, "foo", "EnterDateTime", "not a date");
			parseError(oType, "Feb 28, 2014, 11:69:30 AM", "EnterDateTime", "invalid time");
		});

		//*****************************************************************************************
		test("validate (DateTime)", function () {
			validate(sTypeName, {}, "EnterDateTime");
		});

		//*****************************************************************************************
		test("format, parse, validate (DateTime)", function () {
			formatParseValidate(sTypeName, {}, oDateTime);
		});

		//*****************************************************************************************
		test("localization change", function () {
			var oControl = new sap.ui.core.Control(),
				oType = createInstance(sTypeName);

			oControl.bindProperty("tooltip", {path: "/unused", type: oType});
			sap.ui.getCore().getConfiguration().setLanguage("de-DE");
			strictEqual(oType.formatValue(oDateTime, "string"),
				sap.ui.core.format.DateFormat.getDateTimeInstance().format(oDateTime),
				"adjusted to changed language");
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.type.DateTime", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	dateTime("sap.ui.model.odata.type.DateTime");

	//*********************************************************************************************
	jQuery.each([
		{i: {}, o: undefined},
		{i: {nullable: true, displayFormat: "Date"}, o: {isDateOnly: true}},
		{i: {nullable: false, displayFormat: "foo"}, o: {nullable: false},
			warning: "Illegal displayFormat: foo"},
		{i: {nullable: "true", displayFormat: 1}, o: undefined,
			warning: "Illegal displayFormat: 1"},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"},
    ], function (i, oFixture) {
		test("setConstraints(" + JSON.stringify(oFixture.i) + ")", sinon.test(function () {
			var oType = new sap.ui.model.odata.type.DateTime();

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.DateTime");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType.setConstraints(oFixture.i);
			deepEqual(oType.oConstraints, oFixture.o);
		}));
	});

	//*********************************************************************************************
	test("format and parse (Date)", sinon.test(function () {
		var oType = new sap.ui.model.odata.type.DateTime({}, {displayFormat: "Date"});

		strictEqual(oType.formatValue(oDateOnly, "string"), sFormattedDateOnly,
			"target type string");
		deepEqual(oType.parseValue(sFormattedDateOnly, "string"), oDateOnly);

		parseError(oType, "Feb 30, 2014", "EnterDate", "invalid date");

		// back to DateTime, see that resetting the constraints works
		oType.setConstraints();
		strictEqual(oType.formatValue(oDateTime, "string"), sFormattedDateTime);
	}));

	//*********************************************************************************************
	test("validate (Date)", function () {
		validate("sap.ui.model.odata.type.DateTime", {displayFormat: "Date"}, "EnterDate");
	});

	//*********************************************************************************************
	test("format, parse, validate (Date)", function () {
		formatParseValidate("sap.ui.model.odata.type.DateTime", {displayFormat: "Date"},
			oDateOnly);
	});

	//*********************************************************************************************
	//*********************************************************************************************
	module("sap.ui.model.odata.type.DateTimeOffset", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	dateTime("sap.ui.model.odata.type.DateTimeOffset");

	//*********************************************************************************************
	jQuery.each([
		{i: {}, o: undefined},
		{i: {nullable: true, displayFormat: "Date"}, o: undefined},
		{i: {nullable: false, isDateOnly: true}, o: {nullable: false}},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"},
    ], function (i, oFixture) {
		test("setConstraints(" + JSON.stringify(oFixture.i) + ")", sinon.test(function () {
			var oType = new sap.ui.model.odata.type.DateTimeOffset();

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null,
					"sap.ui.model.odata.type.DateTimeOffset");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType.setConstraints(oFixture.i);
			deepEqual(oType.oConstraints, oFixture.o);
		}));
	});
} ());
