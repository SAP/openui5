/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/future",
	"sap/base/i18n/Localization",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/type/Date",
	"sap/ui/test/TestUtils"
], function (future, Localization, UI5Date, FormatException, ParseException, ValidateException, DateType, TestUtils) {
	/*global QUnit*/
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

	/**
	 * Calls the <code>parseValue</code> function on the given date and checks that a ParseException
	 * with the given error message is thrown.
	 *
	 * @param {object} assert QUnit's object with the assertion methods
	 * @param {sap.ui.model.type.Date} oType The date instance
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

	/**
	 * Calls the <code>validateValue</code> function on the given date and checks that a ValidateException
	 * with the given error message is thrown.
	 *
	 * @param {object} assert QUnit's object with the assertion methods
	 * @param {sap.ui.model.type.Date} oType The date instance
	 * @param {any} vValue The value to be validated
	 * @param {string} sExpectedMessage The expected error message key followed by the optional arguments
	 */
	function checkValidateException(assert, oType, vValue, sExpectedMessage) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.validateValue(vValue);
				assert.ok(false, "Expected ValidateException not thrown");
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, sExpectedMessage);
			}
		});
	}

	//*****************************************************************************************************************
	QUnit.module("sap.ui.model.type.Date", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function() {
			Localization.setLanguage("en-US");
		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
	QUnit.test("formatValue: unsupported type (future:false)", function (assert) {
		try {
			future.active = false;
			const oDateType = new DateType({source: {pattern: "timestamp"}, pattern: "dd.MM.yy"});
			oDateType.formatValue(1044068706007, "unsupported type");
			assert.ok(false, "Expected FormatException not thrown");
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message, "Don't know how to format Date to unsupported type");
		} finally {
			future.active = undefined;// restores configured default
		}
	});

	//*****************************************************************************************************************
	QUnit.test("formatValue: unsupported type (future:true)", function (assert) {
		try {
			future.active = true;
			const oDateType = new DateType({source: {pattern: "timestamp"}, pattern: "dd.MM.yy"});
			oDateType.formatValue(1044068706007, "unsupported type");
			assert.ok(false, "Expected Error not thrown");
		} catch (e) {
			assert.ok(e instanceof Error);
			assert.strictEqual(e.message, "data type 'unsupported type' could not be found.");
		} finally {
			future.active = undefined; // restores configured default
		}
	});

	//*****************************************************************************************************************
	QUnit.test("formatValue", function (assert) {
		var oDateType,
			oDateValue = UI5Date.getInstance(2003, 1, 1);

		oDateType = new DateType();
		assert.strictEqual(oDateType.formatValue(oDateValue, "string"), "Feb 1, 2003");

		oDateType = new DateType({pattern: "yy-MM-dd"});
		assert.strictEqual(oDateType.formatValue(oDateValue, "string"), "03-02-01");

		oDateType = new DateType({pattern: "yy-MM-dd EEE"});
		assert.strictEqual(oDateType.formatValue(oDateValue, "string"), "03-02-01 Sat");

		oDateType = new DateType({pattern: "yy 'week' w, EEE"});
		assert.strictEqual(oDateType.formatValue(oDateValue, "string"), "03 week 5, Sat");

		oDateType = new DateType({source: {pattern: "yyyy/MM/dd"}, pattern: "dd.MM.yyyy"});
		assert.strictEqual(oDateType.formatValue("2012/01/23", "string"), "23.01.2012");

		oDateType = new DateType({source: {pattern: "timestamp"}, pattern: "dd.MM.yy"});
		assert.strictEqual(oDateType.formatValue(oDateValue.getTime(), "string"), "01.02.03");
		assert.strictEqual(oDateType.formatValue(null, "string"), "");
		assert.strictEqual(oDateType.formatValue(undefined, "string"), "");
	});

	/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
	QUnit.test("parseValue: unsupported type (future:false)", function (assert) {
		try {
			future.active = false;
			const oDateType = new DateType({source: {pattern: "timestamp"}, pattern: "dd.MM.yy"});
			oDateType.parseValue(true, "unsupported type");
			assert.ok(false, "Expected ParseException not thrown");
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message, "Don't know how to parse Date from unsupported type");
		} finally {
			future.active = undefined;// restores configured default
		}
	});

	//*****************************************************************************************************************
	QUnit.test("parseValue: unsupported type (future:true)", function (assert) {
		try {
			future.active = true;
			const oDateType = new DateType({source: {pattern: "timestamp"}, pattern: "dd.MM.yy"});
			oDateType.parseValue(true, "unsupported type");
			assert.ok(false, "Expected Error not thrown");
		} catch (e) {
			assert.ok(e instanceof Error);
			assert.strictEqual(e.message, "data type 'unsupported type' could not be found.");
		} finally {
			future.active = undefined; // restores configured default
		}
	});

	//*****************************************************************************************************************
	QUnit.test("parseValue", function (assert) {
		var oDateType,
			oDateValue = UI5Date.getInstance(2003, 1, 1);

		oDateType = new DateType();
		assert.strictEqual(oDateType.parseValue("Feb 1, 2003", "string").getTime(), oDateValue.getTime());

		oDateType = new DateType({pattern: "yy-MM-dd"});
		assert.strictEqual(oDateType.parseValue("03-02-01", "string").getTime(), oDateValue.getTime());

		oDateType = new DateType({pattern: "yy-MM-dd EEE"});
		assert.strictEqual(oDateType.parseValue("03-02-01 Sat", "string").getTime(), oDateValue.getTime());

		oDateType = new DateType({pattern: "yy 'week' w, EEE"});
		assert.strictEqual(oDateType.parseValue("03 week 5, Sat", "string").getTime(), oDateValue.getTime());

		oDateType = new DateType({source: {pattern: "yyyy/MM/dd"}, pattern: "dd.MM.yyyy"});
		assert.strictEqual(oDateType.parseValue("01.02.2003", "string"), "2003/02/01");

		oDateType = new DateType({source: {pattern: "timestamp"}, pattern: "dd.MM.yy"});
		assert.strictEqual(oDateType.parseValue("01.02.03", "string"), oDateValue.getTime());

		checkParseException(assert, oDateType, true, "boolean",
			"Don't know how to parse Date from boolean");
		checkParseException(assert, oDateType, "test", "string", "Date.Invalid");
	});

	//*****************************************************************************************************************
	QUnit.test("validateValue", function (assert) {
		var oDateType = new DateType(null, {
				minimum: UI5Date.getInstance(2000, 0, 1),
				maximum: UI5Date.getInstance(2000, 11, 31)
			}),
			oDateValue = UI5Date.getInstance(2000, 1, 1);

		oDateType.validateValue(oDateValue);
		checkValidateException(assert, oDateType, UI5Date.getInstance(1999, 1, 1), "Date.Minimum Jan 1, 2000");
		checkValidateException(assert, oDateType, UI5Date.getInstance(2001, 1, 1), "Date.Maximum Dec 31, 2000");

		oDateType = new DateType({
			pattern: 'yyyy-MM-dd'
		}, {
			minimum: UI5Date.getInstance(2018, 0, 1),
			maximum: UI5Date.getInstance(2019, 11, 31)
		});
		checkValidateException(assert, oDateType, UI5Date.getInstance(2017, 0, 1), "Date.Minimum 2018-01-01");

		oDateType = new DateType({
			source: {pattern: "dd.MM.yyyy"},
			pattern: "yyyy/MM/dd"
		}, {
			minimum: "01.01.2000",
			maximum: "31.12.2000"
		});
		oDateType.validateValue("01.01.2000");
		oDateType.validateValue("06.06.2000");
		oDateType.validateValue("31.12.2000");
		checkValidateException(assert, oDateType, "10.10.1999", "Date.Minimum 2000/01/01");
		checkValidateException(assert, oDateType, "10.10.2001", "Date.Maximum 2000/12/31");

		// TODO: Fix the existing error in Date.js
		// oDateType = new DateType({
		// 	source: {pattern: "timestamp"},
		// 	pattern: "yyyy/MM/dd"
		// }, {
		// 	minimum: UI5Date.getInstance(2000, 0, 1).getTime(),
		// 	maximum: UI5Date.getInstance(2000, 11, 31).getTime()
		// });
		// checkValidateException(assert, oDateType, UI5Date.getInstance(1999, 9, 10).getTime(), "Date.Minimum 2000/01/01");
		// checkValidateException(assert, oDateType, UI5Date.getInstance(2001, 9, 10).getTime(), "Date.Maximum 2000/12/31");
	});

	//*****************************************************************************************************************
	QUnit.test("getModelFormat() without source option", function (assert) {
		var sDate = "01.01.2000",
			oDateType = new DateType(),
			oDateValue = UI5Date.getInstance(2001, 1, 1),
			oFormat = oDateType.getModelFormat();

		assert.strictEqual(oFormat.format(oDateValue), oDateValue);
		assert.strictEqual(oFormat.parse(sDate), sDate);
	});

	//*****************************************************************************************************************
	QUnit.test("getModelFormat() with timestamp", function (assert) {
		var oDateType = new DateType({source: {pattern: "timestamp"}}),
			oDateValue = UI5Date.getInstance(2000, 1, 1),
			oParsedTimestamp = oDateType.getModelFormat().parse(oDateValue.getTime());

		assert.ok(oParsedTimestamp instanceof Date);
		assert.strictEqual(oParsedTimestamp.getDate(), 1);
	});

	//*****************************************************************************************************************
	QUnit.test("getModelFormat() with default source option", function (assert) {
		var oDateType = new DateType({source: {}}),
			oFormat = oDateType.getModelFormat(),
			sValue = "2002-01-02",
			oDateValue = oFormat.parse(sValue);

		assert.ok(oDateValue instanceof Date);
		assert.strictEqual(oDateValue.getFullYear(), 2002);
		assert.strictEqual(oDateValue.getMonth(), 0);
		assert.strictEqual(oDateValue.getDate(), 2);
	});

	//*****************************************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new DateType();

		this.mock(oType.oOutputFormat).expects("getPlaceholderText").withExactArgs().returns("~placeholder");

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});
});