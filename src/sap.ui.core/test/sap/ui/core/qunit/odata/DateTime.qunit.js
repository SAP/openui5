/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oDateTime = new Date(2014, 10, 27, 13, 47, 26),
		oMessages = {
			"EnterDateTime": "Enter a date and a time (like Nov 27, 2014, 1:47:26 PM).",
			"EnterDate": "Enter a date (like Nov 27, 2014)."
		};

	jQuery.sap.require("sap.ui.core.Control");
	jQuery.sap.require("sap.ui.core.format.DateFormat");
	jQuery.sap.require("sap.ui.model.odata.type.DateTime");

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
	function validate(oConstraints, sExpectedErrorKey) {
		var oType = new sap.ui.model.odata.type.DateTime({}, oConstraints);

		oType.validateValue(null);

		oConstraints.nullable = false;
		oType.setConstraints(oConstraints);
		validateError(oType, null, sExpectedErrorKey, "nullable");

		try {
			oType.validateValue("foo");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message, "Illegal sap.ui.model.odata.type.DateTime value: foo");
		}
		oType.validateValue(new Date());
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

	//*********************************************************************************************
	test("basics", function () {
		var oDefaultConstraints = {},
			oType = new sap.ui.model.odata.type.DateTime();

		ok(oType instanceof sap.ui.model.odata.type.DateTime, "is a DateTime");
		ok(oType instanceof sap.ui.model.SimpleType, "is a SimpleType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.DateTime", "type name");
		deepEqual(oType.oConstraints, oDefaultConstraints, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");

		oType.setFormatOptions({foo: "bar"});
		strictEqual(oType.oFormatOptions, undefined, "format options ignored");

		oType.setConstraints();
		deepEqual(oType.oConstraints, oDefaultConstraints, "default constraints");
	});

	//*********************************************************************************************
	jQuery.each([
		{i: {}, o: {}},
		{i: {nullable: true, displayFormat: "Date"}, o: {displayFormat: "Date"}},
		{i: {nullable: false, displayFormat: "foo"}, o: {nullable: false},
			warning: "Illegal displayFormat: foo"},
		{i: {nullable: "true", displayFormat: 1}, o: {},
			warning: "Illegal displayFormat: 1"},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: {}, warning: "Illegal nullable: foo"},
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
	test("format (DateTime)", function () {
		var oType = new sap.ui.model.odata.type.DateTime();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue(oDateTime, "any"), oDateTime, "target type any");
		strictEqual(oType.formatValue(oDateTime, "string"),
			sap.ui.core.format.DateFormat.getDateTimeInstance().format(oDateTime),
			"target type string");
		jQuery.each(["int", "float", "boolean"], function (i, sType) {
			try {
				oType.formatValue(oDateTime, sType);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.FormatException);
				strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.DateTime to " + sType);
			}
		});
	});

	//*********************************************************************************************
	test("parse (DateTime)", function () {
		var sFormattedDate = sap.ui.core.format.DateFormat.getDateTimeInstance().format(oDateTime),
			oType = new sap.ui.model.odata.type.DateTime();

		strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");
		deepEqual(oType.parseValue(sFormattedDate, "string"), oDateTime);

		jQuery.each(["int", "float", "boolean"], function (i, sType) {
			try {
				oType.parseValue(sFormattedDate, sType);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ParseException, sType + ": exception");
				strictEqual(e.message,
					"Don't know how to parse sap.ui.model.odata.type.DateTime from " + sType,
					sType + ": message");
			}
		});

		parseError(oType, "foo", "EnterDateTime", "not a date");
		parseError(oType, "Feb 28, 2014, 11:69:30 AM", "EnterDateTime", "invalid time");
	});

	//*********************************************************************************************
	test("format and parse (Date)", sinon.test(function () {
		var oType = new sap.ui.model.odata.type.DateTime({}, {displayFormat: "Date"}),
			oDate, sFormattedDate;

		oDate = new Date();
		oDate.setUTCFullYear(2014);
		oDate.setUTCMonth(10);
		oDate.setUTCDate(27);
		oDate.setUTCHours(0);
		oDate.setUTCMinutes(0);
		oDate.setUTCSeconds(0);
		oDate.setUTCMilliseconds(0);

		sFormattedDate = sap.ui.core.format.DateFormat.getDateInstance().format(oDate);
		strictEqual(oType.formatValue(oDate, "string"), sFormattedDate, "target type string");
		deepEqual(oType.parseValue(sFormattedDate, "string"), oDate);

		parseError(oType, "Feb 30, 2014", "EnterDate", "invalid date");

		// back to DateTime, see that resetting the constraints works
		oType.setConstraints();
		strictEqual(oType.formatValue(oDateTime, "string"),
			sap.ui.core.format.DateFormat.getDateTimeInstance().format(oDateTime));
	}));

	//*********************************************************************************************
	test("validate (DateTime)", function () {
		validate({}, "EnterDateTime");
	});

	//*********************************************************************************************
	test("validate (Date)", function () {
		validate({displayFormat: "Date"}, "EnterDate");
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.DateTime();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		sap.ui.getCore().getConfiguration().setLanguage("de-DE");
		strictEqual(oType.formatValue(oDateTime, "string"),
			sap.ui.core.format.DateFormat.getDateTimeInstance().format(oDateTime),
			"adjusted to changed language");
	});
} ());
