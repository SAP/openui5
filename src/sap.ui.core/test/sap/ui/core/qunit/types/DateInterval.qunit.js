/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/type/DateInterval",
	"sap/ui/test/TestUtils"
], function (future, Log, Localization, UI5Date, FormatException, ParseException, ValidateException,
		DateInterval, TestUtils) {
	/*global QUnit, sinon */
	"use strict";

	const sDefaultLanguage = Localization.getLanguage();
	// ignore messages for sync loading of CLDR data, message resource bundle and manifest.json files
	const rNoSync = /\[nosync\] loading resource '.*\.(json|properties)'/;

	/*
	 * Calls the <code>formatValue</code> function on the given date interval and checks that a
	 * FormatException with the given error message is thrown.
	 *
	 * @param {object} assert QUnit's object with the assertion methods
	 * @param {sap.ui.model.type.DateInterval} oType The date interval instance
	 * @param {any} vValues The values to be formatted
	 * @param {string} sTargetType The target type
	 * @param {string} sExpectedMessage The expected error message
	 */
	function checkFormatException(assert, oType, vValues, sTargetType, sExpectedMessage) {
		try {
			oType.formatValue(vValues, sTargetType);
			assert.ok(false, "Expected FormatException not thrown");
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message, sExpectedMessage);
		}
	}

	/*
	 * Calls the <code>parseValue</code> function on the given date interval and checks that a
	 * ParseException with the given error message is thrown.
	 *
	 * @param {object} assert QUnit's object with the assertion methods
	 * @param {sap.ui.model.type.DateInterval} oType The date interval instance
	 * @param {any} vValue The value to be parsed
	 * @param {string} sSourceType The source type
	 * @param {string} sExpectedMessage The expected error message key followed by the optional arguments
	 */
	function checkParseException(assert, oType, vValue, sSourceType, sExpectedMessage) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue(vValue, sSourceType);
				assert.ok(false, "Expected ParseException not thrown");
			} catch (e) {
				assert.ok(e instanceof ParseException);
				assert.strictEqual(e.message, sExpectedMessage);
			}
		});
	}

	/*
	 * Calls the <code>validateValue</code> function on the given date interval and checks that a
	 * ValidateException with the given error message is thrown.
	 *
	 * @param {object} assert QUnit's object with the assertion methods
	 * @param {sap.ui.model.type.DateInterval} oType The date interval instance
	 * @param {any} vValues The values to be validated
	 * @param {string} sExpectedMessage The expected error message key followed by the optional arguments
	 */
	function checkValidateException(assert, oType, vValues, sExpectedMessage) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.validateValue(vValues);
				assert.ok(false, "Expected ValidateException not thrown");
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, sExpectedMessage);
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.DateInterval", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			// ignore log messages caused by synchronous loading of CLDR data, message bundles and manifest.json files
			this.oLogMock.expects("warning").atLeast(0).withExactArgs(sinon.match(rNoSync));
			Localization.setLanguage("en-US");
		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("formatValue", function (assert) {
		var oDate1 = UI5Date.getInstance(2003, 10, 6),
			oDate2 = UI5Date.getInstance(2003, 11, 6),
			oDateInterval = new DateInterval({format: "yMMMd"});

		assert.strictEqual(oDateInterval.formatValue([oDate1, oDate2], "string"),
			"Nov 6\u2009\u2013\u2009Dec 6, 2003", "dates can be formatted as interval");
		assert.strictEqual(oDateInterval.formatValue([UI5Date.getInstance(1970, 0, 1), oDate2], "string"),
			"Jan 1, 1970\u2009\u2013\u2009Dec 6, 2003");
		checkFormatException(assert, oDateInterval, oDate1, "string",
			"Cannot format date interval: " + oDate1 + " is expected as an Array but given the wrong format");
		assert.strictEqual(oDateInterval.formatValue([oDate1], "string"), "", "format type with invalid parameter");

		oDateInterval = new DateInterval({format: "yMMMd", source: {pattern: "timestamp"}});

		assert.strictEqual(oDateInterval.formatValue([oDate1.getTime(), oDate2.getTime()], "string"),
			"Nov 6\u2009\u2013\u2009Dec 6, 2003", "timestamps can be formatted as interval");
		assert.strictEqual(oDateInterval.formatValue([String(oDate1.getTime()), oDate2.getTime()], "string"),
			"Nov 6\u2009\u2013\u2009Dec 6, 2003", "timestamps can be formatted as interval");
		checkFormatException(assert, oDateInterval, ["a", "a"], "string",
			"Cannot format date: a is not a valid Timestamp");

		oDateInterval = new DateInterval({format: "yMMMd", source: {pattern: "yyyy-MM-dd"}});

		checkFormatException(assert, oDateInterval, ["2017", "2018"], "string",
			"Cannot format date: null has the wrong format");
	});
	/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
	QUnit.test("formatValue: unsupported type (future:false)", function (assert) {
		try {
			future.active = false;
			const oDateInterval = new DateInterval({format: "yMMMd"});
			this.oLogMock.expects("error").withExactArgs("[FUTURE FATAL] data type 'untype' could not be found.");

			// code under test
			oDateInterval.formatValue([UI5Date.getInstance(2003, 10, 6), UI5Date.getInstance(2003, 11, 6)], "untype");

			assert.ok(false, "Expected FormatException not thrown");
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message, "Don't know how to format Date to untype");
		} finally {
			future.active = undefined;// restores configured default
		}
	});

	//*****************************************************************************************************************
	QUnit.test("formatValue: unsupported type (future:true)", function (assert) {
		try {
			future.active = true;
			const oDateInterval = new DateInterval({format: "yMMMd"});

			// code under test
			oDateInterval.formatValue([UI5Date.getInstance(2003, 10, 6), UI5Date.getInstance(2003, 11, 6)], "untype");

			assert.ok(false, "Expected Error not thrown");
		} catch (e) {
			assert.ok(e instanceof Error);
			assert.strictEqual(e.message, "data type 'untype' could not be found.");
		} finally {
			future.active = undefined; // restores configured default
		}
	});

	//*********************************************************************************************
	QUnit.test("parseValue", function (assert) {
		var oDate1 = UI5Date.getInstance(2003, 10, 6),
			oDate2 = UI5Date.getInstance(2003, 11, 6, 23, 59, 59, 0),
			oDateInterval = new DateInterval({format: "yMMMd"});

		assert.deepEqual(oDateInterval.parseValue("", "string"), [null, null],
			"empty string can be parsed into an array of nulls");
		assert.deepEqual(oDateInterval.parseValue("Nov 6 - Dec 6, 2003", "string"),
			[oDate1, oDate2], "Interval string can be parsed into an array of dates");
		checkParseException(assert, oDateInterval, "Nov 6", "string", "DateInterval.Invalid");

		oDateInterval = new DateInterval({format: "yMMMd", source: {pattern: "timestamp"}});

		assert.deepEqual(oDateInterval.parseValue("Nov 6 - Dec 6, 2003", "string"),
			[oDate1.getTime(), oDate2.getTime()], "Interval string can be parsed into an array of timestamps");

		oDateInterval = new DateInterval({format: "yMMMd", source: {}});

		assert.deepEqual(oDateInterval.parseValue("Nov 6 - Dec 6, 2003", "string"),
			["2003-11-06", "2003-12-06"], "Interval string can be parsed into an array of defined dates");
	});
	/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
	QUnit.test("parseValue: unsupported type (future:false)", function (assert) {
		try {
			future.active = false;
			const oDateInterval = new DateInterval({format: "yMMMd"});
			this.oLogMock.expects("error").withExactArgs("[FUTURE FATAL] data type 'untype' could not be found.");

			// code under test
			oDateInterval.parseValue("Nov 6 - Dec 6, 2003", "untype");

			assert.ok(false, "Expected ParseException not thrown");
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message, "Don't know how to parse a date interval from untype");
		} finally {
			future.active = undefined;// restores configured default
		}
	});

	//*****************************************************************************************************************
	QUnit.test("parseValue: unsupported type (future:true)", function (assert) {
		try {
			future.active = true;
			const oDateInterval = new DateInterval({format: "yMMMd"});

			// code under test
			oDateInterval.parseValue("Nov 6 - Dec 6, 2003", "untype");

			assert.ok(false, "Expected Error not thrown");
		} catch (e) {
			assert.ok(e instanceof Error);
			assert.strictEqual(e.message, "data type 'untype' could not be found.");
		} finally {
			future.active = undefined; // restores configured default
		}
	});

	//*********************************************************************************************
	QUnit.test("parseValue: UTC", function (assert) {
		var oDateInterval = new DateInterval({UTC: true}),
			oUTCDate1 = UI5Date.getInstance(Date.UTC(2003, 10, 6, 0, 0, 0, 0)),
			oUTCDate2 = UI5Date.getInstance(Date.UTC(2003, 11, 6, 23, 59, 59, 0));

		// code under test
		assert.deepEqual(oDateInterval.parseValue("Nov 6, 2003 - Dec 6, 2003", "string"), [oUTCDate1, oUTCDate2]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: singleIntervalValue", function (assert) {
		var oDate1 = UI5Date.getInstance(2003, 10, 6),
			oDateInterval = new DateInterval({singleIntervalValue: true});

		assert.deepEqual(oDateInterval.parseValue("Nov 6, 2003", "string"), [oDate1, null],
			"Interval string can be parsed into an array of dates");
		checkParseException(assert, oDateInterval, "Nov 6", "string", "DateInterval.Invalid");
	});

	//*********************************************************************************************
	QUnit.test("validateValue", function (assert) {
		var oDate1 = UI5Date.getInstance(2003, 10, 6),
			oDate2 = UI5Date.getInstance(2003, 11, 6),
			oDateInterval = new DateInterval({
				format: "yMMMd",
				source: {pattern: "timestamp"}
			}, {
				minimum: oDate1.getTime(),
				maximum: oDate2.getTime()
			}),
			oPreDate = UI5Date.getInstance(2003, 10, 5),
			oSufDate = UI5Date.getInstance(2003, 11, 7);

		assert.strictEqual(oDateInterval.validateValue([oDate1.getTime(), oDate2.getTime()]), undefined);

		checkValidateException(assert, oDateInterval, [oPreDate.getTime(), oDate2.getTime()],
			"Date.Minimum " + oDate1.getTime());

		checkValidateException(assert, oDateInterval, [oDate1.getTime(), oSufDate.getTime()],
			"Date.Maximum " + oDate2.getTime());

		checkValidateException(assert, oDateInterval, [oPreDate.getTime(), oDate1],
			"Date.Minimum " + oDate1.getTime());

		checkValidateException(assert, oDateInterval, [oDate2, oSufDate], "Date.Maximum " + oDate2.getTime());

		oDateInterval = new DateInterval({
			format: "yMMMd",
			source: {}
		}, {
			minimum: oDate1.getTime(),
			maximum: oDate2.getTime()
		});

		assert.strictEqual(oDateInterval.validateValue(["2003-11-06", "2003-12-06"]), undefined);
	});

	//*********************************************************************************************
	QUnit.test("validateValue: singleIntervalValue", function (assert) {
		var oDate1 = UI5Date.getInstance(2003, 10, 6),
			oDate2 = UI5Date.getInstance(2003, 11, 6),
			oDateInterval = new DateInterval({
				format: "yMMMd",
				singleIntervalValue: true
			}, {
				minimum: oDate1.getTime(),
				maximum: oDate2.getTime()
			}),
			oPreDate = UI5Date.getInstance(2003, 10, 5),
			oSufDate = UI5Date.getInstance(2003, 11, 7);

		assert.strictEqual(oDateInterval.validateValue([oDate1.getTime(), null]), undefined,
			"Interval string can be parsed into an array of dates");
		assert.strictEqual(oDateInterval.validateValue([oDate1.getTime()]), undefined,
			"Interval string can be parsed into an array of dates");

		checkValidateException(assert, oDateInterval, [oDate1.getTime(), oSufDate.getTime()],
			"Date.Maximum " + oDate2.getTime());

		checkValidateException(assert, oDateInterval, [oPreDate.getTime(), oDate2.getTime()],
			"Date.Minimum " + oDate1.getTime());

		checkValidateException(assert, oDateInterval, [oPreDate.getTime(), null],
			"Date.Minimum " + oDate1.getTime());

		checkValidateException(assert, oDateInterval, [oSufDate.getTime(), null],
			"Date.Maximum " + oDate2.getTime());

		checkValidateException(assert, oDateInterval, [null, oDate1.getTime()],
			"Date.Minimum " + oDate1.getTime());

		checkValidateException(assert, oDateInterval, [null, null], "Date.Minimum " + oDate1.getTime());
	});

	//*********************************************************************************************
	QUnit.test("_handleLocalizationChange", function (assert) {
		var oDateInterval = new DateInterval();

		this.mock(oDateInterval).expects("_createFormats").withExactArgs();

		// code under test
		oDateInterval._handleLocalizationChange();
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new DateInterval();

		this.mock(oType.oOutputFormat).expects("getPlaceholderText").withExactArgs().returns("~placeholder");

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});
});
