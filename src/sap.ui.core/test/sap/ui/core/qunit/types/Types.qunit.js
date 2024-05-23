/*global QUnit, sinon */
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/DateTimeInterval",
	"sap/ui/model/type/FileSize",
	"sap/ui/model/type/Float",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Time",
	"sap/ui/model/type/TimeInterval",
	"sap/ui/model/type/Unit",
	"sap/ui/test/TestUtils"
], function(future, Log, Formatting, Localization, Library, UI5Date, NumberFormat, FormatException, ParseException,
		ValidateException, BooleanType, CurrencyType, DateTimeType, DateTimeIntervalType, FileSizeType, FloatType,
		IntegerType, StringType, TimeType, TimeIntervalType, UnitType, TestUtils) {
	"use strict";

	function checkValidateException(oEx) {
		// Exception fails, if translation text can not be found (message looks like the translation key)
		return oEx instanceof ValidateException && !/^\w+\.\w+$/.test(oEx.message);
	}

	function checkParseException(oEx) {
		// Exception fails, if translation text can not be found (message looks like the translation key)
		return oEx instanceof ParseException && !/^\w+\.\w+$/.test(oEx.message);
	}

	/**
	 * Tests the internal format option defaulting of showMeasure and showNumber for Currency and
	 * Unit instances.
	 *
	 * @param {object} assert
	 *   The QUnit assert object
	 * @param {sap.ui.model.type.Currency|sap.ui.model.type.Unit} Type
	 *   The type class
	 */
	function checkShowMeasureShowNumberDefaulting(assert, Type) {
		var oType;

		// code under test: defaulting if oFormatOptions is undefined
		oType = new Type();

		assert.strictEqual(oType.bShowMeasure, true);
		assert.strictEqual(oType.bShowNumber, true);

		// code under test: defaulting if showMeasure/showNumber is not set in oFormatOptions
		oType = new Type({});

		assert.strictEqual(oType.bShowMeasure, true);
		assert.strictEqual(oType.bShowNumber, true);

		// code under test: falsy showMeasure/showNumber values
		[false, undefined, null, 0].forEach(function (vFalsy) {
			oType = new Type({showMeasure : vFalsy, showNumber : vFalsy});

			assert.strictEqual(oType.bShowMeasure, vFalsy);
			assert.strictEqual(oType.bShowNumber, vFalsy);
		});

		// code under test: truthy showMeasure/showNumber values
		[true, "foo", 42].forEach(function (vTruthy) {
			oType = new Type({showMeasure : vTruthy, showNumber : vTruthy});

			assert.strictEqual(oType.bShowMeasure, vTruthy);
			assert.strictEqual(oType.bShowNumber, vTruthy);
		});
	}

	/**
	 * Calls the given function with the internal type "untype" on the given type instance and checks that the given
	 * exception is thrown. Uses <code>future.active = false</code> to simulate the behavior of UI5 1.x.
	 *
	 * @param {object} assert The QUnit assert object
	 * @param {sap.ui.model.type.Type} oType The type instance
	 * @param {"formatValue"|"parseValue"} sFunction The function to be called on the type instance
	 * @param {any} vValue The value to be passed to the function
	 * @param {sap.ui.model.FormatException|sap.ui.model.ParseException} oException The expected exception instance
	 *
	 * @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error
	 */
	function checkUnsupportedTypeOld(assert, oType, sFunction, vValue, oException) {
		future.active = false;
		assert.throws(() => {
			// code under test
			oType[sFunction](vValue, "untype");
		}, oException);
		future.active = undefined;// restores configured default
	}

	/**
	 * Calls the given function with the internal type "untype" on the given type instance and checks that an error is
	 * thrown, that the internal type is not supported. Uses <code>future.active = true</code> to simulate the behavior
	 * of UI5 2.x.
	 *
	 * @param {object} assert The QUnit assert object
	 * @param {sap.ui.model.type.Type} oType The type instance
	 * @param {"formatValue"|"parseValue"} sFunction The function to be called on the type instance
	 * @param {any} vValue The value to be passed to the function
	 */
	function checkUnsupportedType(assert, oType, sFunction, vValue) {
		future.active = true;
		assert.throws(() => {
			// code under test - with UI5 2.0 unsupported types throw an Error
			oType[sFunction](vValue, "untype");
		}, new Error("data type 'untype' could not be found."));
		future.active = undefined;// restores configured default
	}

	var sDefaultLanguage = Localization.getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.Boolean", {
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

	QUnit.test("boolean formatValue", function (assert) {
		var boolType = new BooleanType();
		assert.strictEqual(boolType.formatValue(true, "boolean"), true, "format test");
		assert.strictEqual(boolType.formatValue(null, "boolean"), null, "format test");
		assert.strictEqual(boolType.formatValue(undefined, "boolean"), null, "format test");
		assert.strictEqual(boolType.formatValue(false, "boolean"), false, "format test");
		assert.strictEqual(boolType.formatValue(true, "string"), "true", "format test");
		assert.strictEqual(boolType.formatValue(false, "string"), "false", "format test");
		assert.throws(function () { boolType.formatValue(true, "int"); }, "format test");
		assert.throws(function () { boolType.formatValue(false, "int"); }, "format test");
		assert.throws(function () { boolType.formatValue(true, "float"); }, "format test");
		assert.throws(function () { boolType.formatValue(false, "float"); }, "format test");
	});

	QUnit.test("boolean parseValue", function (assert) {
		var boolType = new BooleanType();
		assert.strictEqual(boolType.parseValue(true, "boolean"), true, "parse test");
		assert.strictEqual(boolType.parseValue(false, "boolean"), false, "parse test");
		assert.strictEqual(boolType.parseValue("true", "string"), true, "parse test");
		assert.strictEqual(boolType.parseValue("false", "string"), false, "parse test");
		assert.strictEqual(boolType.parseValue("X", "string"), true, "parse test");
		assert.strictEqual(boolType.parseValue("", "string"), false, "parse test");
		assert.strictEqual(boolType.parseValue(" ", "string"), false, "parse test");

		assert.throws(function () { boolType.parseValue(true, "int"); }, ParseException, "parse test");
		assert.throws(function () { boolType.parseValue(false, "int"); }, ParseException, "parse test");
		assert.throws(function () { boolType.parseValue(true, "float"); }, ParseException, "parse test");
		assert.throws(function () { boolType.parseValue(false, "float"); }, ParseException, "parse test");
		assert.throws(function () { boolType.parseValue("xxx", "string"); }, checkParseException, "parse test");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.Currency", {
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

	//*********************************************************************************************
	QUnit.test("constructor: set bShowNumber and bShowMeasure", function (assert) {
		checkShowMeasureShowNumberDefaulting(assert, CurrencyType);
	});

	//*********************************************************************************************
[
	{preserveDecimals : true},
	{preserveDecimals : "yes"},
	{preserveDecimals : undefined},
	{preserveDecimals : null},
	{preserveDecimals : false},
	{preserveDecimals : true, style : "short"},
	{preserveDecimals : "yes", style : "short"},
	{preserveDecimals : undefined, style : "short"},
	{preserveDecimals : null, style : "short"},
	{preserveDecimals : false, style : "short"},
	{preserveDecimals : true, style : "long"},
	{preserveDecimals : "yes", style : "long"},
	{preserveDecimals : undefined, style : "long"},
	{preserveDecimals : null, style : "long"},
	{preserveDecimals : false, style : "long"}
].forEach(function (oFormatOptions, i) {
	QUnit.test("setFormatOptions: oFormatOptions.preserveDecimals given; #" + i, function (assert) {
		var oType = {
				_createFormats : function () {}
			};

		this.mock(Log).expects("warning").never();
		this.mock(oType).expects("_createFormats").withExactArgs();

		// code under test
		CurrencyType.prototype.setFormatOptions.call(oType, oFormatOptions);

		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions);
		assert.deepEqual(oType.oFormatOptions, oFormatOptions);
	});
});

	//*********************************************************************************************
[{
	formatOption : {foo : "bar"},
	result : {foo : "bar", preserveDecimals : true}
}, {
	formatOption : {foo : "bar", style : "standard"},
	result : {foo : "bar", preserveDecimals : true, style : "standard"}
}, {
	formatOption : {foo : "bar", style : "short"},
	result : {foo : "bar", style : "short"}
}, {
	formatOption : {foo : "bar", style : "long"},
	result : {foo : "bar", style : "long"}
}].forEach(function (oFixture, i) {
	QUnit.test("setFormatOptions: no preserveDecimals, #" + i, function (assert) {
		var oType = {
				_createFormats : function () {}
			};

		this.mock(Log).expects("warning").never();
		this.mock(oType).expects("_createFormats").withExactArgs();

		// code under test
		CurrencyType.prototype.setFormatOptions.call(oType, oFixture.formatOption);

		assert.notStrictEqual(oType.oFormatOptions, oFixture.formatOption);
		assert.deepEqual(oType.oFormatOptions, oFixture.result);
	});
});

	QUnit.test("currency formatValue", function (assert) {
		var currencyType = new CurrencyType();
		assert.strictEqual(currencyType.formatValue([22, "EUR"], "string"), "22.00" + "\xa0" + "EUR", "format test");
		assert.strictEqual(currencyType.formatValue([22, "JPY"], "string"), "22" + "\xa0" + "JPY", "format test");
		assert.strictEqual(currencyType.formatValue([-6622.333, "EUR"], "string"), "-6,622.333" + "\xa0" + "EUR", "format test");
		assert.strictEqual(currencyType.formatValue([1.0, "EUR"], "string"), "1.00" + "\xa0" + "EUR", "format test");
		assert.strictEqual(currencyType.formatValue([1.0000, "EUR"], "string"), "1.00" + "\xa0" + "EUR", "format test");

		assert.strictEqual(currencyType.formatValue(null, "string"), null, "format test");
		assert.strictEqual(currencyType.formatValue([null, "EUR"], "string"), null, "format test");
		assert.strictEqual(currencyType.formatValue([1, null], "string"), "1.00", "format test");

		assert.throws(function () { currencyType.formatValue(22.0, "int"); }, FormatException, "format test");
		assert.throws(function () { currencyType.formatValue(22.0, "float"); }, FormatException, "format test");
		assert.throws(function () { currencyType.formatValue(22.0, "untype"); }, FormatException, "format test");
	});

	//*********************************************************************************************
[
	{formatOptions : {}, result : null},
	{formatOptions : {showNumber : true}, result : null},
	{formatOptions : {showNumber : false}, result : "~formatted"}
].forEach(function (oFixture, i) {
	[null, undefined].forEach(function (vInputValue) {
	var sTitle = "formatValue: showNumber=false skips invalid number check; " + i + ", "
			+ vInputValue;

	QUnit.test(sTitle, function (assert) {
		var bSkipFormat = oFixture.result === null,
			oType = new CurrencyType(oFixture.formatOptions),
			aValues = [vInputValue, "EUR"];

		this.mock(oType).expects("getPrimitiveType").withExactArgs("string")
			.exactly(bSkipFormat ? 0 : 1)
			.returns("string");
		this.mock(oType.oOutputFormat).expects("format").withExactArgs(sinon.match.same(aValues))
			.exactly(bSkipFormat ? 0 : 1)
			.returns("~formatted");

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "string"), oFixture.result);
	});
	});
});

	QUnit.test("currency parseValue", function (assert) {
		var currencyType = new CurrencyType();

		assert.deepEqual(currencyType.parseValue("3333", "string"), [3333, undefined], "parse test");
		assert.deepEqual(currencyType.parseValue("USD" + "\xa0" + "3333.555", "string"), [3333.555, "USD"], "parse test");
		assert.deepEqual(currencyType.parseValue("EUR3.555", "string"), [3.555, "EUR"], "parse test");
		assert.deepEqual(currencyType.parseValue("¥-3.555", "string"), [-3.555, "JPY"], "parse test");

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, currencyType, "parseValue", true,
			new ParseException("Don't know how to parse Currency from untype"));
		checkUnsupportedType(assert, currencyType, "parseValue", true);
		assert.throws(function () { currencyType.parseValue(true, "boolean"); }, ParseException, "parse test");
		assert.throws(function () { currencyType.parseValue("test", "string"); }, checkParseException, "parse test");
	});

	QUnit.test("parseValue: format option 'showNumber'; only enter the currency", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				// code under test
				new CurrencyType().parseValue("USD", "string");
			}, new ParseException("Currency.Invalid"));

			assert.throws(function () {
				// code under test
				new CurrencyType({showNumber : true}).parseValue("USD", "string");
			}, new ParseException("Currency.Invalid"));
		});

		// code under test
		assert.deepEqual(new CurrencyType({showNumber : false}).parseValue("USD", "string"),
			[undefined, "USD"]);
	});

	QUnit.test("currency validateValue", function (assert) {
		var currencyType,
			oLogMock = this.mock(Log);

		oLogMock.expects("warning").never();

		currencyType = new CurrencyType(null, {minimum: 3, maximum: 10});
		try {
			assert.strictEqual(currencyType.validateValue([3.0, "EUR"]), undefined, "validate test");
			assert.strictEqual(currencyType.validateValue([3.01, "USD"]), undefined, "validate test");
			assert.strictEqual(currencyType.validateValue([10, "JPY"]), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { currencyType.validateValue([2.99999, "USD"]); }, checkValidateException, "validate test");
		assert.throws(function () { currencyType.validateValue([10.0000001, "EUR"]); }, checkValidateException, "validate test");

		currencyType = new CurrencyType(undefined, {unknown : 3});

		oLogMock.expects("warning")
			.withExactArgs("Unknown constraint 'unknown': Value is not validated.", null,
				"sap.ui.model.type.Currency");

		// code under test
		currencyType.validateValue([3.0, "EUR"]);
	});

	QUnit.test("currency formatOptions", function (assert) {
		var currencyType = new CurrencyType({
			showMeasure: false
		});

		assert.strictEqual(currencyType.formatValue([22, "USD"], "string"), "22.00", "format test");
		assert.strictEqual(currencyType.formatValue([-6622.333, "USD"], "string"), "-6,622.333", "format test");
		assert.strictEqual(currencyType.formatValue([-6622.339, "EUR"], "string"), "-6,622.339", "format test");
		assert.strictEqual(currencyType.formatValue([1.0, "USD"], "string"), "1.00", "format test");
		assert.strictEqual(currencyType.formatValue([1.0000, "JPY"], "string"), "1", "format test");
		assert.strictEqual(currencyType.formatValue([1.009, "EUR"], "string"), "1.009", "format test");
		assert.strictEqual(currencyType.formatValue([1.00001, "USD"], "string"), "1.00001", "format test");

		currencyType = new CurrencyType({
			currencyCode: false
		});

		assert.strictEqual(currencyType.formatValue([22, "USD"], "string"), "$22.00", "format test");
		assert.strictEqual(currencyType.formatValue([-6622.333, "USD"], "string"), "$" + "\ufeff" + "-6,622.333", "format test");
		assert.strictEqual(currencyType.formatValue([-6622.339, "EUR"], "string"), "€" + "\ufeff" + "-6,622.339", "format test");
		assert.strictEqual(currencyType.formatValue([1.0, "USD"], "string"), "$1.00", "format test");
		assert.strictEqual(currencyType.formatValue([1.0000, "JPY"], "string"), "¥1", "format test");
		assert.strictEqual(currencyType.formatValue([1.009, "EUR"], "string"), "€1.009", "format test");
		assert.strictEqual(currencyType.formatValue([1.00001, "USD"], "string"), "$1.00001", "format test");
	});

	QUnit.test("currency formatOptions.source", function (assert) {
		var currencyType = new CurrencyType({
			source: {}
		});

		assert.strictEqual(currencyType.parseValue("EUR3333", "string"), "3333.00" + "\xa0" + "EUR", "parse test");
		assert.strictEqual(currencyType.parseValue("USD3333.555", "string"), "3333.56" + "\xa0" + "USD", "parse test");
		assert.strictEqual(currencyType.parseValue("$3.555", "string"), "3.56" + "\xa0" + "USD", "parse test");
		assert.strictEqual(currencyType.parseValue("JPY-3.555", "string"), "-4" + "\xa0" + "JPY", "parse test");

		assert.strictEqual(currencyType.formatValue("EUR22", "string"), "22.00" + "\xa0" + "EUR", "format test");
		assert.strictEqual(currencyType.formatValue("USD-6622.333", "string"), "-6,622.333" + "\xa0" + "USD", "format test");
		assert.strictEqual(currencyType.formatValue("JPY-6622.339", "string"), "-6,622.339" + "\xa0" + "JPY", "format test");
	});

	QUnit.test("currency formatOptions.source and validateValue", function (assert) {
		var currencyType = new CurrencyType({
			source: {}
		}, {
			minimum: 3,
			maximum: 10
		});
		try {
			assert.strictEqual(currencyType.validateValue("EUR3.00"), undefined, "validate test");
			assert.strictEqual(currencyType.validateValue("USD3.01"), undefined, "validate test");
			assert.strictEqual(currencyType.validateValue("JPY10"), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { currencyType.validateValue("USD2.99999"); }, checkValidateException, "validate test");
		assert.throws(function () { currencyType.validateValue("EUR10.0000001"); }, checkValidateException, "validate test");
	});

	QUnit.test("Parse/Format emptyString values", function (assert) {
		// default: "" --> NaN
		var oCurrencyType = new CurrencyType(/* emptyString is NaN by default */);

		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oCurrencyType.parseValue("", "string");
			});
		}, new ParseException("Currency.Invalid"));

		// "" --> NaN
		var oCurrencyType2 = new CurrencyType({emptyString: NaN});
		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oCurrencyType2.parseValue("", "string");
			});
		}, new ParseException("Currency.Invalid"));

		// "" --> ""
		var oCurrencyType3 = new CurrencyType({emptyString: ""});
		assert.deepEqual(oCurrencyType3.parseValue("", "string"), ["", undefined], "Empty string is returned");

		// "" --> null
		var oCurrencyType4 = new CurrencyType({emptyString: null});
		assert.deepEqual(oCurrencyType4.parseValue("", "string"), [null, undefined], "null is returned");

		// "" --> 0
		var oCurrencyType5 = new CurrencyType({emptyString: 0});
		assert.deepEqual(oCurrencyType5.parseValue("", "string"), [0, undefined], "0 is returned");
	});

	QUnit.test("Parse/Format emptyString values (parseAsString)", function (assert) {
		// default: "" --> "NaN"
		var oCurrencyType = new CurrencyType({
				parseAsString: true // emptyString is NaN by default
			});

		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oCurrencyType.parseValue("", "string");
			});
		}, new ParseException("Currency.Invalid"));

		// "" --> "NaN"
		var oCurrencyType2 = new CurrencyType({emptyString: NaN, parseAsString: true});
		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oCurrencyType2.parseValue("", "string");
			});
		}, new ParseException("Currency.Invalid"));

		// "" --> ""
		var oCurrencyType3 = new CurrencyType({emptyString: "", parseAsString: true});
		assert.deepEqual(oCurrencyType3.parseValue("", "string"), ["", undefined], "Empty string is returned");

		// "" --> null
		var oCurrencyType4 = new CurrencyType({emptyString: null, parseAsString: true});
		assert.deepEqual(oCurrencyType4.parseValue("", "string"), [null, undefined], "null is returned");

		// "" --> 0
		var oCurrencyType5 = new CurrencyType({emptyString: 0, parseAsString: true});
		assert.deepEqual(oCurrencyType5.parseValue("", "string"), ["0", undefined], "0 is returned");
	});

	QUnit.test("currency parseValue with strict mode - CLDR (showMeasure=true)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: true
		});

		// OK
		assert.deepEqual(currencyType.parseValue("123.45 €", "string"), [123.45, "EUR"], "parse valid input");
		assert.deepEqual(currencyType.parseValue("123.45 EUR", "string"), [123.45, "EUR"], "parse valid input");
		assert.deepEqual(currencyType.parseValue("123.45 FOO", "string"), [123.45, "FOO"], "parse valid input");

		// null value
		//assert.throws(function () { currencyType.parseValue(null, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of null value under showMeature=true in strict mode results in exception");
		// undefined value
		//assert.throws(function () { currencyType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of undefined value under showMeature=true in strict mode results in exception");
		// 0 value
		//assert.throws(function () { currencyType.parseValue(0, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse of 0 value under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 F", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 FOOB", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// no unit
		assert.throws(function () { currencyType.parseValue("3333.555", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string without currency under showMeature=true in strict mode results in exception");
		// no value
		assert.throws(function () { currencyType.parseValue("kg", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with only currency under showMeature=true in strict mode results in exception");
		// no value and no valid currency
		assert.throws(function () { currencyType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a random string under showMeature=true in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { currencyType.parseValue("", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse empty string under showMeature=true in strict mode results in exception");

		// empty string is set to ""
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: true,
			emptyString: ""
		});
		assert.deepEqual(currencyType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: true,
			emptyString: 0
		});
		assert.deepEqual(currencyType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

	QUnit.test("currency parseValue with strict mode - CLDR (showMeasure=false)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: false
		});

		// OK
		assert.deepEqual(currencyType.parseValue("123.45", "string"), [123.45, undefined], "parse valid input");

		// null value
		//assert.throws(function () { currencyType.parseValue(null, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of null value under showMeature=true in strict mode results in exception");
		// undefined value
		//assert.throws(function () { currencyType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of undefined value under showMeature=true in strict mode results in exception");
		// 0 value
		//assert.throws(function () { currencyType.parseValue(0, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse of 0 value under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 F", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 FOOB", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// unknown currencies (normally accepted because of 3-letter code --> still invalid in showMeasure=false & strictParsing=true)
		assert.throws(function () { currencyType.parseValue("3333.555 FOO", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// known currency (invalid in strict mode)
		assert.throws(function () { currencyType.parseValue("3333.555 EUR", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string without currency under showMeature=true in strict mode results in exception");
		// known currency symbol (invalid in strict mode)
		assert.throws(function () { currencyType.parseValue("3333.555 €", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string without currency under showMeature=true in strict mode results in exception");
		// no value, but currency code
		assert.throws(function () { currencyType.parseValue("EUR", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with only currency under showMeature=true in strict mode results in exception");
		// no value, but currency symbol
		assert.throws(function () { currencyType.parseValue("€", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with only currency under showMeature=true in strict mode results in exception");
		// no value and no valid currency (random string)
		assert.throws(function () { currencyType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a random string under showMeature=true in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { currencyType.parseValue("", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse empty string under showMeature=true in strict mode results in exception");

		// empty string is set to ""
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: false,
			emptyString: ""
		});
		assert.deepEqual(currencyType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: false,
			emptyString: 0
		});
		assert.deepEqual(currencyType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

	QUnit.test("currency parseValue with strict mode - Custom (showMeasure=true)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var mCustomCurrencies = {
			"BTC": {
				"symbol": "Ƀ",
				"decimals": 3
			},
			"DOL": {
				"decimals": 3,
				"symbol": "$"
			},
			"EU": {
				"decimals": 2,
				"symbol": "€"
			},
			"EURO": {
				"decimals": 4,
				"symbol": "€"
			}
		};

		var currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: true,
			customCurrencies: mCustomCurrencies
		});

		// OK
		assert.deepEqual(currencyType.parseValue("123.45 Ƀ", "string"), [123.45, "BTC"], "parse valid input");
		assert.deepEqual(currencyType.parseValue("123.45 DOL", "string"), [123.45, "DOL"], "parse valid input");
		assert.deepEqual(currencyType.parseValue("123.45 $", "string"), [123.45, "DOL"], "parse valid input");

		// null value
		//assert.throws(function () { currencyType.parseValue(null, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of null value under showMeature=true in strict mode results in exception");
		// undefined value
		//assert.throws(function () { currencyType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of undefined value under showMeature=true in strict mode results in exception");
		// 0 value
		//assert.throws(function () { currencyType.parseValue(0, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse of 0 value under showMeature=true in strict mode results in exception");

		// valid currency with 3-letter code
		assert.throws(function () { currencyType.parseValue("3333.555 FOO", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// valid currency in CLDR, unknown in custom currencies
		assert.throws(function () { currencyType.parseValue("3333.555 USD", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 F", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 FOOB", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// no currency
		assert.throws(function () { currencyType.parseValue("3333.555", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string without currency under showMeature=true in strict mode results in exception");
		// ambiguous currency
		assert.throws(function () { currencyType.parseValue("3333.555 €", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string without currency under showMeature=true in strict mode results in exception");
		// no value
		assert.throws(function () { currencyType.parseValue("€", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with only currency under showMeature=true in strict mode results in exception");
		// no value 2
		assert.throws(function () { currencyType.parseValue("EU", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a string with only currency under showMeature=true in strict mode results in exception");
		// no value and no valid currency
		assert.throws(function () { currencyType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse a random string under showMeature=true in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { currencyType.parseValue("", "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse empty string under showMeature=true in strict mode results in exception");

		// empty string is set to ""
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: true,
			emptyString: "",
			customCurrencies: mCustomCurrencies
		});
		assert.deepEqual(currencyType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: true,
			emptyString: 0,
			customCurrencies: mCustomCurrencies
		});
		assert.deepEqual(currencyType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

	QUnit.test("currency parseValue with strict mode - Custom (showMeasure=false)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var mCustomCurrencies = {
			"BTC": {
				"symbol": "Ƀ",
				"decimals": 3
			},
			"DOL": {
				"decimals": 3,
				"symbol": "$"
			},
			"EU": {
				"decimals": 2,
				"symbol": "€"
			},
			"EURO": {
				"decimals": 4,
				"symbol": "€"
			}
		};

		var currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: false,
			customCurrencies: mCustomCurrencies
		});

		// OK
		assert.deepEqual(currencyType.parseValue("123.45", "string"), [123.45, undefined], "parse valid input");

		// null value
		//assert.throws(function () { currencyType.parseValue(null, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of null value under showMeature=true in strict mode results in exception");
		// undefined value
		//assert.throws(function () { currencyType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parsing of undefined value under showMeature=true in strict mode results in exception");
		// 0 value
		//assert.throws(function () { currencyType.parseValue(0, "string"); }, new ParseException(oBundle.getText("Currency.Invalid")), "parse of 0 value under showMeature=true in strict mode results in exception");

		// valid currency with 3-letter code
		assert.throws(function () { currencyType.parseValue("3333.555 FOO", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// valid currency in CLDR, unknown in custom currencies
		assert.throws(function () { currencyType.parseValue("3333.555 USD", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 F", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// unknown currencies
		assert.throws(function () { currencyType.parseValue("3333.555 FOOB", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with invalid currency under showMeature=true in strict mode results in exception");
		// ambiguous currency
		assert.throws(function () { currencyType.parseValue("3333.555 €", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string ambiguous currency under showMeature=true in strict mode results in exception");
		// no value
		assert.throws(function () { currencyType.parseValue("€", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with only currency under showMeature=true in strict mode results in exception");
		// no value 2
		assert.throws(function () { currencyType.parseValue("EU", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with only currency under showMeature=true in strict mode results in exception");
		// no value and no valid currency
		assert.throws(function () { currencyType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a random string under showMeature=true in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { currencyType.parseValue("", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse empty string under showMeature=true in strict mode results in exception");

		// empty string is set to ""
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: false,
			emptyString: "",
			customCurrencies: mCustomCurrencies
		});
		assert.deepEqual(currencyType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		currencyType = new CurrencyType({
			strictParsing: true,
			showMeasure: false,
			emptyString: 0,
			customCurrencies: mCustomCurrencies
		});
		assert.deepEqual(currencyType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

[
	{oFormatOptions : undefined, aResult : []},
	{oFormatOptions : {}, aResult : []},
	{oFormatOptions : {showMeasure : true}, aResult : []},
	{oFormatOptions : {showMeasure : false}, aResult : [1]},
	{oFormatOptions : {showNumber : true}, aResult : []},
	{oFormatOptions : {showNumber : false}, aResult : [0]}
].forEach(function (oFixture, i) {
	QUnit.test("Currency: getPartsIgnoringMessages, #" + i, function (assert) {
		var oCurrencyType = new CurrencyType(oFixture.oFormatOptions);

		// code under test
		assert.deepEqual(oCurrencyType.getPartsIgnoringMessages(), oFixture.aResult);
	});
});

	//*********************************************************************************************
	QUnit.test("Currency: getPartsListeningToTypeChanges", function (assert) {
		const oCurrencyType = {bShowNumber: true};

		// code under test
		assert.deepEqual(CurrencyType.prototype.getPartsListeningToTypeChanges.call(oCurrencyType), [0]);

		oCurrencyType.bShowNumber = false;

		// code under test
		assert.deepEqual(CurrencyType.prototype.getPartsListeningToTypeChanges.call(oCurrencyType), []);
	});

	//*********************************************************************************************
[
	{aTypes:[]}, // no types
	{aTypes:[{}], expScale:0, oldScale:0}, // no constraints
	{aTypes:[{oConstraints:{}}], expScale:0, oldScale:0}, // no scale
	{aTypes:[{oConstraints:{scale:24}}], expScale:24, expCreateFormats:1}, // consider scale
	// only the first type is considered
	{aTypes:[{oConstraints:{scale:24}}, {oConstraints:{scale:42}}], expScale:24, expCreateFormats:1},
	// scale unchanged, no new formats
	{aTypes:[{oConstraints:{scale:24}}], oldScale:24, expScale:24},
	// scale reset, recreate formats
	{aTypes:[{oConstraints:{}}], oldScale:24, expScale:0, expCreateFormats:1}
].forEach(({aTypes, expScale, expCreateFormats, oldScale}, i) => {
	QUnit.test("Currency: processPartTypes, i=" + i, function (assert) {
		const oCurrencyType = {iScale: oldScale, _createFormats() {}};
		if (aTypes[0]) {
			aTypes[0].isA = () => {};
			this.mock(aTypes[0]).expects("isA").withExactArgs("sap.ui.model.odata.type.Decimal").returns(true);
		}
		this.mock(oCurrencyType).expects("_createFormats").withExactArgs().exactly(expCreateFormats || 0);

		// code under test
		CurrencyType.prototype.processPartTypes.call(oCurrencyType, aTypes);

		assert.strictEqual(oCurrencyType.iScale, expScale);
	});
});

	//*********************************************************************************************
	QUnit.test("Currency: processPartTypes, first part has non-Decimal type", function (assert) {
		const oCurrencyType = {};
		const oNonDecimalType = {isA() {}};
		this.mock(oNonDecimalType).expects("isA").withExactArgs("sap.ui.model.odata.type.Decimal").returns(false);

		// code under test
		CurrencyType.prototype.processPartTypes.call(oCurrencyType, [oNonDecimalType]);
	});

	//*********************************************************************************************
[
	{iScale : undefined, oFormatOptions : {}},
	{iScale : -1, oFormatOptions : {}}, // edge case: negative scale
	{iScale : 0, oFormatOptions : {}, oExpectedOptions : {maxFractionDigits : 0}}, // edge case: zero scale
	{iScale : 42, oFormatOptions : {}, oExpectedOptions : {maxFractionDigits : 42}},
	// oFormatOptions.maxFractionDigits in favor of iScale
	{iScale : 42, oFormatOptions : {maxFractionDigits : 24}, oExpectedOptions : {maxFractionDigits : 24}},
	// decimals scale="variable" is mapped to Infinity and also used in favor of iScale
	{iScale : Infinity, oFormatOptions : {}, oExpectedOptions : {maxFractionDigits : Infinity}}
].forEach(({iScale, oFormatOptions, oExpectedOptions}, i) => {
	QUnit.test("Currency: _createFormats: consider iScale, " + i, function (assert) {
		const oCurrencyType = {oFormatOptions : oFormatOptions, iScale : iScale};
		this.mock(NumberFormat).expects("getCurrencyInstance")
			.withExactArgs(oExpectedOptions ? oExpectedOptions : sinon.match.same(oCurrencyType.oFormatOptions))
			.returns("~CurrencyInstance");

		// code under test
		CurrencyType.prototype._createFormats.call(oCurrencyType);

		assert.strictEqual(oCurrencyType.oOutputFormat, "~CurrencyInstance");
	});
});

	//*********************************************************************************************
	QUnit.test("Currency: _createFormats: consider oFormatOptions.source", function (assert) {
		const oFormatOptions = {};
		const oCurrencyType = {oFormatOptions : oFormatOptions};
		const oNumberFormatMock = this.mock(NumberFormat);

		oNumberFormatMock.expects("getCurrencyInstance")
			.withExactArgs(sinon.match.same(oCurrencyType.oFormatOptions))
			.returns("~OutputCurrencyInstance");

		// code under test (no input format options)
		CurrencyType.prototype._createFormats.call(oCurrencyType);

		assert.strictEqual(oCurrencyType.oOutputFormat, "~OutputCurrencyInstance");

		oCurrencyType.oFormatOptions.source = {notEmptyObject : true};
		oNumberFormatMock.expects("getCurrencyInstance")
			.withExactArgs(sinon.match.same(oCurrencyType.oFormatOptions))
			.returns("~OutputCurrencyInstance");
		oNumberFormatMock.expects("getCurrencyInstance")
			.withExactArgs(sinon.match.same(oFormatOptions.source))
			.returns("~InputCurrencyInstance");

		// code under test (non empty input format options)
		CurrencyType.prototype._createFormats.call(oCurrencyType);

		assert.strictEqual(oCurrencyType.oOutputFormat, "~OutputCurrencyInstance");
		assert.strictEqual(oCurrencyType.oInputFormat, "~InputCurrencyInstance");

		oCurrencyType.oFormatOptions.source = {/*empty object*/};
		oNumberFormatMock.expects("getCurrencyInstance")
			.withExactArgs(sinon.match.same(oCurrencyType.oFormatOptions))
			.returns("~OutputCurrencyInstance");
		oNumberFormatMock.expects("getCurrencyInstance")
			.withExactArgs({groupingEnabled: false, groupingSeparator: ",", decimalSeparator: "."})
			.returns("~InputCurrencyInstance");

		// code under test (no input format options, create default input format)
		CurrencyType.prototype._createFormats.call(oCurrencyType);

		assert.strictEqual(oCurrencyType.oOutputFormat, "~OutputCurrencyInstance");
		assert.strictEqual(oCurrencyType.oInputFormat, "~InputCurrencyInstance");
		assert.deepEqual(oCurrencyType.oFormatOptions.source, {/*still empty object*/});
	});

	//*********************************************************************************************
[{
	oFormatOptions : {},
	sResult : "Currency.Invalid"
}, {
	oFormatOptions : {showMeasure : false},
	sResult : "EnterNumber"
}, {
	oFormatOptions : {showNumber : false},
	sResult : "Currency.InvalidMeasure"
}].forEach(function (oFixture, i) {
	QUnit.test("Currency: getParseException #" + i, function (assert) {
		var oResult,
			oType = new CurrencyType(oFixture.oFormatOptions);

		TestUtils.withNormalizedMessages(function () {
			// code under test
			oResult = oType.getParseException();
		});

		assert.ok(oResult instanceof ParseException);
		assert.strictEqual(oResult.message, oFixture.sResult);
	});
});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.DateTime", {
		beforeEach : function() {
			Localization.setLanguage("en-US");
		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("dateTime formatValue", function (assert) {
		// as date object is locale dependend fill it manually
		var dateValue = UI5Date.getInstance(2003, 1, 1, 4, 5, 6, 7);

		var dateType = new DateTimeType();

		assert.strictEqual(dateType.formatValue(dateValue, "string"), "Feb 1, 2003, 4:05:06\u202FAM", "format test");

		dateType = new DateTimeType({ pattern: "yy-MM-dd '/' hh:mm" });
		assert.strictEqual(dateType.formatValue(dateValue, "string"), "03-02-01 / 04:05", "format test with pattern");

		dateType = new DateTimeType({ source: { pattern: "yyyy/MM/dd HH/mm/ss/SSS" }, pattern: "dd.MM.yyyy HH:mm:ss '+' SSS'" });
		assert.strictEqual(dateType.formatValue("2012/01/23 18/30/05/123", "string"), "23.01.2012 18:30:05 + 123", "format test with source pattern");

		dateType = new DateTimeType({ source: { pattern: "timestamp" }, pattern: "dd.MM.yy hh:mm:ss'+'SSS" });
		assert.strictEqual(dateType.formatValue(dateValue.getTime(), "string"), "01.02.03 04:05:06+007", "format test with timestamp");

		assert.strictEqual(dateType.formatValue(null, "string"), "", "format test");
		assert.strictEqual(dateType.formatValue(undefined, "string"), "", "format test");
		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, dateType, "formatValue", dateValue.getTime(),
			new FormatException("Don't know how to format Date to untype"));
		checkUnsupportedType(assert, dateType, "formatValue", dateValue.getTime());
	});

	QUnit.test("dateTime parseValue", function (assert) {
		var dateValue = UI5Date.getInstance(2003, 1, 1, 4, 5, 6);
		var dateType = new DateTimeType();
		assert.strictEqual(dateType.parseValue("Feb 1, 2003, 4:05:06 AM", "string").getTime(), dateValue.getTime(), "parse test");

		dateValue = UI5Date.getInstance(2003, 1, 1, 4, 5, 6, 7);
		dateType = new DateTimeType({ pattern: "yy-MM-dd HH:mm:ss'+'SSS'" });
		assert.strictEqual(dateType.parseValue("03-02-01 04:05:06+007", "string").getTime(), dateValue.getTime(), "parse test with pattern");

		dateType = new DateTimeType({ source: { pattern: "yyyy/MM/dd HHmmssSSS" }, pattern: "dd.MM.yyyy HH-mm-ss.SSS" });
		assert.strictEqual(dateType.parseValue("01.02.2003 04-05-06.007", "string"), "2003/02/01 040506007", "parse test with source pattern");

		dateValue = UI5Date.getInstance(2012, 0, 24, 14, 33, 0);
		dateType = new DateTimeType({ source: { pattern: "timestamp" }, pattern: "dd.MM.yyyy HH:mm" });
		assert.strictEqual(dateType.parseValue("24.01.2012 14:33", "string"), dateValue.getTime(), "parse test with timestamp");

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, dateType, "parseValue", true,
			new ParseException("Don't know how to parse Date from untype"));
		checkUnsupportedType(assert, dateType, "parseValue", true);
		assert.throws(function () { dateType.parseValue(true, "boolean"); }, ParseException, "parse test");
		assert.throws(function () { dateType.parseValue("test", "string"); }, checkParseException, "parse test");
	});

	QUnit.test("dateTime validateValue", function (assert) {
		var dateType = new DateTimeType({
			source: { pattern: "dd.MM.yyyy HH:mm:ss" },
			pattern: "yyyy/mm/dd hh/mm/ss"
		}, {
			minimum: "24.01.2012 10:00:00",
			maximum: "24.01.2012 11:00:00"
		});
		try {
			assert.strictEqual(dateType.validateValue("24.01.2012 10:30:00"), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { dateType.validateValue("24.01.2012 09:30:00"); }, checkValidateException, "validate test");
		assert.throws(function () { dateType.validateValue("25.01.2012 10:30:00"); }, checkValidateException, "validate test");
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new DateTimeType();

		this.mock(oType.oOutputFormat).expects("getPlaceholderText").withExactArgs().returns("~placeholder");

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.DateTimeInterval", {
		beforeEach : function() {
			Localization.setLanguage("en-US");
		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("DateTimeInterval formatValue", function (assert) {
		var oDateTimeIntervalType = new DateTimeIntervalType();

		var oDateTime1 = UI5Date.getInstance(2003, 1, 1, 4, 5, 6);
		var oDateTime2 = UI5Date.getInstance(2003, 1, 2, 5, 6, 7);

		assert.strictEqual(oDateTimeIntervalType.formatValue([oDateTime1, oDateTime2], "string"),
			"Feb 1, 2003, 4:05:06\u202FAM\u2009\u2013\u2009Feb 2, 2003, 5:06:07\u202FAM",
			"dates can be formatted as interval");

		oDateTimeIntervalType = new DateTimeIntervalType({
			source: {}
		});
		assert.strictEqual(
			oDateTimeIntervalType.formatValue(["Feb 1, 2003, 4:05:06 AM", "Feb 2, 2003, 5:06:07 AM"], "string"),
			"Feb 1, 2003, 4:05:06\u202FAM\u2009\u2013\u2009Feb 2, 2003, 5:06:07\u202FAM",
			"dates can be formatted as interval");
	});

	QUnit.test("DateTimeInterval parseValue", function (assert) {
		var oDateTimeIntervalType = new DateTimeIntervalType();

		var oDateTime1 = UI5Date.getInstance(2003, 1, 1, 4, 5, 6);
		var oDateTime2 = UI5Date.getInstance(2003, 1, 2, 5, 6, 7);

		assert.deepEqual(
			oDateTimeIntervalType.parseValue("Feb 1, 2003, 4:05:06 AM \u2013 Feb 2, 2003, 5:06:07 AM", "string"),
			[oDateTime1, oDateTime2], "Interval string can be parsed into an array of dates");

		oDateTimeIntervalType = new DateTimeIntervalType({
			source: {}
		});

		assert.deepEqual(
			oDateTimeIntervalType.parseValue("Feb 1, 2003, 4:05:06 AM \u2013 Feb 2, 2003, 5:06:07 AM", "string"),
			["Feb 1, 2003, 4:05:06\u202FAM", "Feb 2, 2003, 5:06:07\u202FAM"],
			"Interval string can be parsed into an array of formatted dates");
	});

	QUnit.test("DateTimeInterval validateValue", function (assert) {
		var oDateTime1 = UI5Date.getInstance(2003, 1, 1, 4, 5, 6);
		var oDateTime2 = UI5Date.getInstance(2003, 1, 2, 5, 6, 7);

		var oDateTimeIntervalType = new DateTimeIntervalType({}, {
			minimum: oDateTime1,
			maximum: oDateTime2
		});

		try {
			assert.strictEqual(oDateTimeIntervalType.validateValue([oDateTime1, oDateTime2]), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "validate test fails");
		}
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new DateTimeIntervalType();

		this.mock(oType.oOutputFormat).expects("getPlaceholderText").withExactArgs().returns("~placeholder");

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.FileSize", {
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

	QUnit.test("filesize formatValue", function (assert) {
		var filesizeType = new FileSizeType();

		assert.strictEqual(filesizeType.formatValue(null, "string"), null, "format test: null-string");
		assert.strictEqual(filesizeType.formatValue(1000, "string").toUpperCase(), "1 KB", "format test: 1000-string");
		assert.strictEqual(filesizeType.formatValue(1000.5, "string").toUpperCase(), "1.0005 KB", "format test: 1000.5-string");
		assert.throws(function () { filesizeType.formatValue("Hello", "string"); }, FormatException, "format test: Hello-string");
		assert.throws(function () { filesizeType.formatValue("1 kB", "string"); }, FormatException, "format test: 1 kB-string");

		assert.strictEqual(filesizeType.formatValue(null, "int"), null, "format test: null-int");
		assert.strictEqual(filesizeType.formatValue(1000, "int"), 1000, "format test: 1000-int");
		assert.strictEqual(filesizeType.formatValue(1000.5, "int"), 1000, "format test: 1000.5-int");
		assert.throws(function () { filesizeType.formatValue("Hello", "int"); }, FormatException, "format test: Hello-int");
		assert.throws(function () { filesizeType.formatValue("1 kB", "int"); }, FormatException, "format test: 1 kB-int");

		assert.strictEqual(filesizeType.formatValue(null, "float"), null, "format test: null-float");
		assert.strictEqual(filesizeType.formatValue(1000, "float"), 1000, "format test: 1000-float");
		assert.strictEqual(filesizeType.formatValue(1000.5, "float"), 1000.5, "format test: 1000.5-float");
		assert.throws(function () { filesizeType.formatValue("Hello", "float"); }, FormatException, "format test: Hello-float");
		assert.throws(function () { filesizeType.formatValue("1 kB", "float"); }, FormatException, "format test: 1 kB-float");

		assert.strictEqual(filesizeType.formatValue(null, "untype"), null, "format test: null-untype");
		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, filesizeType, "formatValue", 1000,
			new FormatException("Don't know how to format FileSize to untype"));
		checkUnsupportedType(assert, filesizeType, "formatValue", 1000);

		filesizeType.setFormatOptions({ source: {} });

		assert.strictEqual(filesizeType.formatValue(null, "string"), null, "format test: null-string-inputformat");
		assert.strictEqual(filesizeType.formatValue(1000, "string").toUpperCase(), "1 KB", "format test: 1000-string-inputformat");
		assert.strictEqual(filesizeType.formatValue(1000.5, "string").toUpperCase(), "1.0005 KB", "format test: 1000.5-string-inputformat");
		assert.throws(function () { filesizeType.formatValue("Hello", "string"); }, FormatException, "format test: Hello-string-inputformat");
		assert.strictEqual(filesizeType.formatValue("1 kB", "string").toUpperCase(), "1 KB", "format test: 1kB-string-inputformat");

		assert.strictEqual(filesizeType.formatValue(null, "int"), null, "format test: null-int-inputformat");
		assert.strictEqual(filesizeType.formatValue(1000, "int"), 1000, "format test: 1000-int-inputformat");
		assert.strictEqual(filesizeType.formatValue(1000.5, "int"), 1000, "format test: 1000.5-int-inputformat");
		assert.throws(function () { filesizeType.formatValue("Hello", "int"); }, FormatException, "format test: Hello-int-inputformat");
		assert.strictEqual(filesizeType.formatValue("1 kB", "int"), 1000, "format test: 1kB-int-inputformat");

		assert.strictEqual(filesizeType.formatValue(null, "float"), null, "format test: null-float-inputformat");
		assert.strictEqual(filesizeType.formatValue(1000, "float"), 1000, "format test: 1000-float-inputformat");
		assert.strictEqual(filesizeType.formatValue(1000.5, "float"), 1000.5, "format test: 1000.5-float-inputformat");
		assert.throws(function () { filesizeType.formatValue("Hello", "float"); }, FormatException, "format test: Hello-float-inputformat");
		assert.strictEqual(filesizeType.formatValue("1 kB", "float"), 1000, "format test: 1kB-float-inputformat");

		assert.strictEqual(filesizeType.formatValue(null, "untype"), null, "format test: null-untype-inputformat");
	});

	QUnit.test("filesize parseValue", function (assert) {
		var filesizeType = new FileSizeType();

		assert.strictEqual(filesizeType.parseValue(null, "string"), null, "parse test: null-string");
		assert.throws(function () { filesizeType.parseValue("Hello", "string"); }, ParseException, "parse test: Hello-string");
		assert.strictEqual(filesizeType.parseValue("1 kB", "string"), 1000, "parse test: 1 kB-string");
		assert.strictEqual(filesizeType.parseValue("1.0005 kB", "string"), 1000.5, "parse test: 1.0005 kB-string");

		assert.strictEqual(filesizeType.parseValue(null, "int"), null, "parse test: null-int");
		assert.strictEqual(filesizeType.parseValue(1000, "int"), 1000, "parse test: 1000-int");
		assert.strictEqual(filesizeType.parseValue(1000.5, "int"), 1000.5, "parse test: 1000.5 kB-int");

		assert.strictEqual(filesizeType.parseValue(null, "float"), null, "parse test: null-float");
		assert.strictEqual(filesizeType.parseValue(1000, "float"), 1000, "parse test: 1000-float");
		assert.strictEqual(filesizeType.parseValue(1000.5, "float"), 1000.5, "parse test: 1000.5 kB-float");

		assert.strictEqual(filesizeType.parseValue(null, "untype"), null, "parse test: null-untype");
		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, filesizeType, "parseValue", 1000,
			new ParseException("Don't know how to parse FileSize from untype"));
		checkUnsupportedType(assert, filesizeType, "parseValue", 1000);

		filesizeType.setFormatOptions({ source: {} });

		assert.strictEqual(filesizeType.parseValue(null, "string"), null, "parse test: null-string-inputformat");
		assert.throws(function () { filesizeType.parseValue("Hello", "string"); }, checkParseException, "parse test: Hello-string-inputformat");
		assert.strictEqual(filesizeType.parseValue("1 kB", "string").toUpperCase(), "1 KB", "parse test: 1 kB-string-inputformat");
		assert.strictEqual(filesizeType.parseValue("1.0005 kB", "string").toUpperCase(), "1.0005 KB", "parse test: 1.0005 kB-string-inputformat");

		assert.strictEqual(filesizeType.parseValue(null, "int"), null, "parse test: null-int-inputformat");
		assert.strictEqual(filesizeType.parseValue(1000, "int").toUpperCase(), "1 KB", "parse test: 1000-int-inputformat");
		assert.strictEqual(filesizeType.parseValue(1000.5, "int").toUpperCase(), "1.0005 KB", "parse test: 1000.5 kB-int-inputformat");

		assert.strictEqual(filesizeType.parseValue(null, "float"), null, "parse test: null-float-inputformat");
		assert.strictEqual(filesizeType.parseValue(1000, "float").toUpperCase(), "1 KB", "parse test: 1000-float-inputformat");
		assert.strictEqual(filesizeType.parseValue(1000.5, "float").toUpperCase(), "1.0005 KB", "parse test: 1000.5 kB-float-inputformat");

		assert.strictEqual(filesizeType.parseValue(null, "untype"), null, "parse test: null-untype");
	});

	QUnit.test("filesize validateValue", function (assert) {
		var filesizeType = new FileSizeType(null, {
			minimum: 1000,
			maximum: 2000
		});

		var filesizeType2 = new FileSizeType(null, {
			minimum: "1 kB",
			maximum: "2 kB"
		});

		try {
			assert.strictEqual(filesizeType.validateValue(1000.0), undefined, "validate test: 1000.0-floatcompare");
			assert.strictEqual(filesizeType.validateValue(1000), undefined, "validate test: 1000-floatcompare");
			assert.strictEqual(filesizeType.validateValue(1500), undefined, "validate test: 1500-floatcompare");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}

		assert.throws(function () { filesizeType.validateValue(2000.1); }, checkValidateException, "validate test: 2000.1-floatcompare");
		assert.throws(function () { filesizeType.validateValue(3000); }, checkValidateException, "validate test: 3000-floatcompare");
		assert.throws(function () { filesizeType.validateValue(500); }, checkValidateException, "validate test: 500-floatcompare");
		assert.throws(function () { filesizeType.validateValue("5 kB"); }, Error, "validate test: 5 kB-floatcompare");
		assert.throws(function () { filesizeType2.validateValue("1.5 kB"); }, Error, "validate test: 1.5 kB-floatcompare");

		assert.throws(function () { filesizeType2.validateValue(1000.0); }, Error, "validate test: 1000.0-stringcompare");
		assert.throws(function () { filesizeType2.validateValue(1000); }, Error, "validate test: 1000-stringcompare");
		assert.throws(function () { filesizeType2.validateValue(1500); }, Error, "validate test: 1500-stringcompare");
		assert.throws(function () { filesizeType2.validateValue(2000.1); }, Error, "validate test: 2000.1-stringcompare");
		assert.throws(function () { filesizeType2.validateValue(3000); }, Error, "validate test: 3000-stringcompare");
		assert.throws(function () { filesizeType2.validateValue(500); }, Error, "validate test: 500-stringcompare");
		assert.throws(function () { filesizeType2.validateValue("5 kB"); }, Error, "validate test: 5 kB-stringcompare");
		assert.throws(function () { filesizeType2.validateValue("1.5 kB"); }, Error, "validate test: 1.5 kB-stringcompare");

		filesizeType.setFormatOptions({ source: {} });
		filesizeType2.setFormatOptions({ source: {} });

		try {
			assert.strictEqual(filesizeType.validateValue(1000.0), undefined, "validate test: 1000.0-floatcompare-inputformat");
			assert.strictEqual(filesizeType.validateValue(1000), undefined, "validate test: 1000-floatcompare-inputformat");
			assert.strictEqual(filesizeType.validateValue(1500), undefined, "validate test: 1500-floatcompare-inputformat");
			assert.strictEqual(filesizeType.validateValue("1.5 kB"), undefined, "validate test: 5 kB-floatcompare-inputformat");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}

		assert.throws(function () { filesizeType.validateValue(2000.1); }, checkValidateException, "validate test: 2000.1-floatcompare-inputformat");
		assert.throws(function () { filesizeType.validateValue(3000); }, checkValidateException, "validate test: 3000-floatcompare-inputformat");
		assert.throws(function () { filesizeType.validateValue(500); }, checkValidateException, "validate test: 500-floatcompare-inputformat");
		assert.throws(function () { filesizeType.validateValue("5 kB"); }, checkValidateException, "validate test: 5 kB-floatcompare-inputformat");

		try {
			assert.strictEqual(filesizeType2.validateValue(1000.0), undefined, "validate test: 1000.0-stringcompare-inputformat");
			assert.strictEqual(filesizeType2.validateValue(1000), undefined, "validate test: 1000-stringcompare-inputformat");
			assert.strictEqual(filesizeType2.validateValue(1500), undefined, "validate test: 1500-stringcompare-inputformat");
			assert.strictEqual(filesizeType2.validateValue("1.5 kB"), undefined, "validate test: 5 kB-stringcompare-inputformat");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}

		assert.throws(function () { filesizeType2.validateValue(2000.1); }, checkValidateException, "validate test: 2000.1-stringcompare-inputformat");
		assert.throws(function () { filesizeType2.validateValue(3000); }, checkValidateException, "validate test: 3000-stringcompare-inputformat");
		assert.throws(function () { filesizeType2.validateValue(500); }, checkValidateException, "validate test: 500-stringcompare-inputformat");
		assert.throws(function () { filesizeType2.validateValue("5 kB"); }, checkValidateException, "validate test: 5 kB-stringcompare-inputformat");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.Float", {
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

	//*********************************************************************************************
[
	{preserveDecimals : true},
	{preserveDecimals : "yes"},
	{preserveDecimals : undefined},
	{preserveDecimals : null},
	{preserveDecimals : false},
	{preserveDecimals : true, style : "short"},
	{preserveDecimals : "yes", style : "short"},
	{preserveDecimals : undefined, style : "short"},
	{preserveDecimals : null, style : "short"},
	{preserveDecimals : false, style : "short"},
	{preserveDecimals : true, style : "long"},
	{preserveDecimals : "yes", style : "long"},
	{preserveDecimals : undefined, style : "long"},
	{preserveDecimals : null, style : "long"},
	{preserveDecimals : false, style : "long"}
].forEach(function (oFormatOptions, i) {
	QUnit.test("setFormatOptions: oFormatOptions.preserveDecimals given; #" + i, function (assert) {
		var oType = {
				_createFormats : function () {}
			};

		this.mock(Log).expects("warning").never();
		this.mock(oType).expects("_createFormats").withExactArgs();

		// code under test
		FloatType.prototype.setFormatOptions.call(oType, oFormatOptions);

		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions);
		assert.deepEqual(oType.oFormatOptions, oFormatOptions);
	});
});

	//*********************************************************************************************
[{
	formatOption : {foo : "bar"},
	result : {foo : "bar", preserveDecimals : true}
}, {
	formatOption : {foo : "bar", style : "standard"},
	result : {foo : "bar", preserveDecimals : true, style : "standard"}
}, {
	formatOption : {foo : "bar", style : "short"},
	result : {foo : "bar", style : "short"}
}, {
	formatOption : {foo : "bar", style : "long"},
	result : {foo : "bar", style : "long"}
}].forEach(function (oFixture, i) {
	QUnit.test("setFormatOptions: no preserveDecimals, #" + i, function (assert) {
		var oType = {
				_createFormats : function () {}
			};

		this.mock(Log).expects("warning").never();
		this.mock(oType).expects("_createFormats").withExactArgs();

		// code under test
		FloatType.prototype.setFormatOptions.call(oType, oFixture.formatOption);

		assert.notStrictEqual(oType.oFormatOptions, oFixture.formatOption);
		assert.deepEqual(oType.oFormatOptions, oFixture.result);
	});
});

	QUnit.test("float formatValue", function (assert) {
		var floatType = new FloatType();
		assert.strictEqual(floatType.formatValue(22, "string"), "22", "format test");
		assert.strictEqual(floatType.formatValue(-6622.333, "string"), "-6,622.333", "format test");
		assert.strictEqual(floatType.formatValue(1.0, "string"), "1", "format test");
		assert.strictEqual(floatType.formatValue(1.0000, "string"), "1", "format test");
		assert.strictEqual(floatType.formatValue(1234, "int"), 1234, "format test");
		assert.strictEqual(floatType.formatValue(34.44, "int"), 34, "format test");
		assert.strictEqual(floatType.formatValue(undefined, "int"), null, "format test");
		assert.strictEqual(floatType.formatValue(null, "int"), null, "format test");
		assert.strictEqual(floatType.formatValue(0, "float"), 0, "format test");
		assert.strictEqual(floatType.formatValue(0.0000, "int"), 0, "format test");
		assert.strictEqual(floatType.formatValue(34.64, "int"), 34, "format test");
		assert.strictEqual(floatType.formatValue(30.000, "int"), 30, "format test");
		assert.strictEqual(floatType.formatValue(134.12, "float"), 134.12, "format test");
		assert.strictEqual(floatType.formatValue(344456.5667, "float"), 344456.5667, "format test");
		assert.strictEqual(floatType.formatValue(-344456.5667, "float"), -344456.5667, "format test");
		assert.strictEqual(floatType.formatValue(134.00, "float"), 134, "format test");
		assert.strictEqual(floatType.formatValue(134.000, "float"), 134, "format test");

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, floatType, "formatValue", 22.0,
			new FormatException("Don't know how to format Float to untype"));
		checkUnsupportedType(assert, floatType, "formatValue", 22.0);
	});

	QUnit.test("float parseValue", function (assert) {
		var floatType = new FloatType();

		assert.strictEqual(floatType.parseValue("3333", "string"), 3333, "parse test");
		assert.strictEqual(floatType.parseValue("3333.555", "string"), 3333.555, "parse test");
		assert.strictEqual(floatType.parseValue("3.555", "string"), 3.555, "parse test");
		assert.strictEqual(floatType.parseValue("-3.555", "string"), -3.555, "parse test");
		assert.strictEqual(floatType.parseValue(-3.555, "float"), -3.555, "parse test");
		assert.strictEqual(floatType.parseValue(-222, "int"), -222, "parse test");
		assert.strictEqual(floatType.parseValue(-4.3657, "float"), -4.3657, "parse test");
		assert.strictEqual(floatType.parseValue(4.657, "float"), 4.657, "parse test");

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, floatType, "parseValue", true,
			new ParseException("Don't know how to parse Float from untype"));
		checkUnsupportedType(assert, floatType, "parseValue", true);
		assert.throws(function () { floatType.parseValue(true, "boolean"); }, ParseException, "parse test");
		assert.throws(function () { floatType.parseValue("test", "string"); }, ParseException, "parse test");
	});

	QUnit.test("float validateValue", function (assert) {
		var floatType = new FloatType(null, {
				minimum: 3,
				maximum: 10
			}),
			oFormatMock;

		try {
			assert.strictEqual(floatType.validateValue(3.0), undefined, "validate test");
			assert.strictEqual(floatType.validateValue(3.01), undefined, "validate test");
			assert.strictEqual(floatType.validateValue(10), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { floatType.validateValue(2.99999); }, checkValidateException, "validate test");
		assert.throws(function () { floatType.validateValue(10.0000001); }, checkValidateException, "validate test");

		floatType = new FloatType(null, {
			minimum: 3.001,
			maximum: 99.99
		});
		oFormatMock = this.mock(floatType.oOutputFormat);
		oFormatMock.expects("format").withExactArgs(3.001).returns("~formatted3.001~");

		// code under test
		assert.throws(function () { floatType.validateValue(3.0); }, /~formatted3.001~/);

		oFormatMock.expects("format").withExactArgs(99.99).returns("~formatted99.99~");

		// code under test
		assert.throws(function () { floatType.validateValue(100); }, /~formatted99.99~/);
	});

	QUnit.test("float formatOptions", function (assert) {
		var floatType = new FloatType({
			minFractionDigits: 2,
			maxFractionDigits: 2
		});

		assert.strictEqual(floatType.formatValue(22, "string"), "22.00", "format test");
		assert.strictEqual(floatType.formatValue(-6622.333, "string"), "-6,622.333", "format test");
		assert.strictEqual(floatType.formatValue(-6622.339, "string"), "-6,622.339", "format test");
		assert.strictEqual(floatType.formatValue(1.0, "string"), "1.00", "format test");
		assert.strictEqual(floatType.formatValue(1.0000, "string"), "1.00", "format test");
		assert.strictEqual(floatType.formatValue(1.009, "string"), "1.009", "format test");
		assert.strictEqual(floatType.formatValue(1.00001, "string"), "1.00001", "format test");

		// TODO is this right?! no formatting for floats?
		// see numberformat.qunit for more formatting tests
		assert.strictEqual(floatType.formatValue(134.12, "float"), 134.12, "format test");
		assert.strictEqual(floatType.formatValue(344456.5667, "float"), 344456.5667, "format test");
		assert.strictEqual(floatType.formatValue(-344456.5667, "float"), -344456.5667, "format test");
		assert.strictEqual(floatType.formatValue(134.00, "float"), 134, "format test");
		assert.strictEqual(floatType.formatValue(134.000, "float"), 134, "format test");
	});

	QUnit.test("float formatOptions.source", function (assert) {
		var floatType = new FloatType({
			source: {}
		});

		assert.strictEqual(floatType.parseValue("3333", "string"), "3333", "parse test");
		assert.strictEqual(floatType.parseValue("3333.555", "string"), "3333.555", "parse test");
		assert.strictEqual(floatType.parseValue("3.555", "string"), "3.555", "parse test");
		assert.strictEqual(floatType.parseValue("-3.555", "string"), "-3.555", "parse test");
		assert.strictEqual(floatType.parseValue(-3.555, "float"), "-3.555", "parse test");
		assert.strictEqual(floatType.parseValue(-222, "int"), "-222", "parse test");

		assert.strictEqual(floatType.formatValue("22", "string"), "22", "format test");
		assert.strictEqual(floatType.formatValue("-6622.333", "string"), "-6,622.333", "format test");
		assert.strictEqual(floatType.formatValue("-6622.339", "string"), "-6,622.339", "format test");
	});

	QUnit.test("float formatOptions.source and validateValue", function (assert) {
		var floatType = new FloatType({
			source: {
				decimalSeparator: ",",
				groupingSeparator: "."
			}
		}, {
			minimum: 3,
			maximum: 10
		});
		try {
			assert.strictEqual(floatType.validateValue("3,0"), undefined, "validate test");
			assert.strictEqual(floatType.validateValue("3,01"), undefined, "validate test");
			assert.strictEqual(floatType.validateValue("10"), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { floatType.validateValue("2,99999"); }, checkValidateException, "validate test");
		assert.throws(function () { floatType.validateValue("10,0000001"); }, checkValidateException, "validate test");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.Integer", {
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

	QUnit.test("integer formatValue", function (assert) {
		var intType = new IntegerType();
		assert.strictEqual(intType.formatValue(22, "string"), "22", "format test");
		assert.strictEqual(intType.formatValue(-6622, "string"), "-6622", "format test");
		assert.strictEqual(intType.formatValue(1234, "int"), 1234, "format test");
		assert.strictEqual(intType.formatValue(null, "int"), null, "format test");
		assert.strictEqual(intType.formatValue(undefined, "int"), null, "format test");
		assert.strictEqual(intType.formatValue(0, "int"), 0, "format test");
		assert.strictEqual(intType.formatValue(0.00, "int"), 0, "format test");
		assert.strictEqual(intType.formatValue(34, "int"), 34, "format test");
		assert.strictEqual(intType.formatValue(134, "float"), 134, "format test");
		assert.strictEqual(intType.formatValue(344456, "float"), 344456, "format test");

		assert.throws(function () { intType.formatValue(33456, "boolean"); }, "format test");
		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, intType, "formatValue", 22,
			new FormatException("Don't know how to format Integer to untype"));
		checkUnsupportedType(assert, intType, "formatValue", 22);
	});

	QUnit.test("integer parseValue", function (assert) {
		var intType = new IntegerType();

		assert.strictEqual(intType.parseValue("3333", "string"), 3333, "parse test");
		assert.strictEqual(intType.parseValue("3,555", "string"), 3555, "parse test");
		assert.strictEqual(intType.parseValue("-3,555", "string"), -3555, "parse test");
		assert.strictEqual(intType.parseValue(-3, "float"), -3, "parse test");
		assert.throws(function () { intType.parseValue("-3.444", "float"); }, ParseException, "parse test");
		assert.strictEqual(intType.parseValue(-222, "int"), -222, "parse test");
		assert.strictEqual(intType.parseValue(4444, "float"), 4444, "parse test");

		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () { intType.parseValue("3333.555", "string"); },
				new ParseException("EnterInt"), "parse test");
			assert.throws(function () { intType.parseValue("true", "float"); },
				new ParseException("EnterInt"), "parse test");
		});
		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, intType, "parseValue", true,
			new ParseException("Don't know how to parse Integer from untype"));
		checkUnsupportedType(assert, intType, "parseValue", true);

		assert.throws(function () { intType.parseValue(true, "boolean"); }, ParseException, "parse test");
		assert.throws(function () { intType.parseValue("test", "string"); }, checkParseException, "parse test");
	});

	QUnit.test("integer validateValue", function (assert) {
		var oFormatMock,
			intType = new IntegerType(null, {
				minimum: 3,
				maximum: 9999
			});

		try {
			assert.strictEqual(intType.validateValue(4), undefined, "validate test");
			assert.strictEqual(intType.validateValue(9999), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { intType.validateValue(-1); }, checkValidateException, "validate test");
		assert.throws(function () { intType.validateValue(10000); }, checkValidateException, "validate test");

		oFormatMock = this.mock(intType.oOutputFormat);
		oFormatMock.expects("format").withExactArgs(3).returns("~formatted3~");

		// code under test
		assert.throws(function () { intType.validateValue(2); }, /~formatted3~/);

		oFormatMock.expects("format").withExactArgs(9999).returns("~formatted9999~");

		// code under test
		assert.throws(function () { intType.validateValue(10000); }, /~formatted9999~/);
	});

	QUnit.test("integer formatOptions", function (assert) {
		var intType = new IntegerType({
			minIntegerDigits: 2,
			maxIntegerDigits: 4
		});

		assert.strictEqual(intType.formatValue(22, "string"), "22", "format test");
		assert.strictEqual(intType.formatValue(333, "string"), "333", "format test");
		assert.strictEqual(intType.formatValue(6666, "string"), "6666", "format test");
		assert.strictEqual(intType.formatValue(-6622, "string"), "-6622", "format test");
		assert.strictEqual(intType.formatValue(662244, "string"), "????", "format test");
		assert.strictEqual(intType.formatValue(1, "string"), "01", "format test");
		// see NumberFormat.qunit for further formatting tests...
	});

	QUnit.test("integer formatOptions.source", function (assert) {
		var intType = new IntegerType({
			source: {
				groupingEnabled: true
			}
		});

		assert.strictEqual(intType.formatValue("22", "string"), "22", "format test");
		assert.strictEqual(intType.formatValue("333", "string"), "333", "format test");
		assert.strictEqual(intType.formatValue("6,666", "string"), "6666", "format test");
		assert.strictEqual(intType.formatValue("-6622", "string"), "-6622", "format test");
		assert.strictEqual(intType.parseValue("3333", "string"), "3,333", "parse test");
		assert.strictEqual(intType.parseValue("3,555", "string"), "3,555", "parse test");
		assert.strictEqual(intType.parseValue("-3,555", "string"), "-3,555", "parse test");
	});

	QUnit.test("integer formatOptions.source and validateValue", function (assert) {
		var intType = new IntegerType({
			source: {
				decimalSeparator: ",",
				groupingSeparator: "."
			}
		}, {
				minimum: 3,
				maximum: 10
			});

		try {
			assert.strictEqual(intType.validateValue("4,0"), undefined, "validate test");
			assert.strictEqual(intType.validateValue("10"), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { intType.validateValue("-1"); }, checkValidateException, "validate test");
		assert.throws(function () { intType.validateValue("3.300"); }, checkValidateException, "validate test");
	});

	QUnit.test("Single constraint", function (assert) {
		var oBundle = {
				getText : function () {}
			},
			oType = new IntegerType(null, {
				minimum: 1
			});

		this.mock(Library).expects("getResourceBundleFor").withExactArgs("sap.ui.core").returns(oBundle);
		this.mock(oBundle).expects("getText").withExactArgs("Integer.Minimum", ["1"]).returns(">=1");

		// code under test
		assert.throws(function () {
			oType.validateValue(0);
		}, function (e) {
			return e instanceof ValidateException && e.message == ">=1";
		}, "ValidateException is thrown with validation message for single contraint");
	});

	QUnit.test("Multiple constraints", function (assert) {
		var oBundle = {
				getText : function () {}
			},
			oBundleMock = this.mock(oBundle),
			oType = new IntegerType(null, {
				minimum: 2,
				maximum: 0
			});

		this.mock(Library).expects("getResourceBundleFor").withExactArgs("sap.ui.core").returns(oBundle);
		oBundleMock.expects("getText").withExactArgs("Integer.Minimum", ["2"]).returns(">=2");
		oBundleMock.expects("getText").withExactArgs("Integer.Maximum", ["0"]).returns("<=0");

		// code under test
		assert.throws(function () {
			oType.validateValue(1);
		}, function (e) {
			return e instanceof ValidateException && e.message == ">=2. <=0.";
		}, "ValidateException is thrown with combined validation message for both contraints");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.String", {
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

	QUnit.test("string formatValue", function (assert) {
		var stringType = new StringType();
		assert.strictEqual(stringType.formatValue("true", "boolean"), true);
		assert.strictEqual(stringType.formatValue("false", "boolean"), false);
		assert.strictEqual(stringType.formatValue("X", "boolean"), true);
		assert.strictEqual(stringType.formatValue("", "boolean"), false);
		assert.strictEqual(stringType.formatValue(undefined, "boolean"), null);
		assert.strictEqual(stringType.formatValue(null, "boolean"), null);
		assert.strictEqual(stringType.formatValue("test", "string"), "test");
		assert.strictEqual(stringType.formatValue("X", "string"), "X");
		assert.strictEqual(stringType.formatValue("1234", "int"), 1234);
		assert.strictEqual(stringType.formatValue("34", "int"), 34);
		assert.strictEqual(stringType.formatValue("1.34", "float"), 1.34);
		assert.strictEqual(stringType.formatValue("33.456", "float"), 33.456);

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, stringType, "formatValue", "33.456",
			new FormatException("Don't know how to format String to untype"));
		checkUnsupportedType(assert, stringType, "formatValue", "33.456");
		assert.throws(function () { stringType.formatValue("notfalse", "boolean"); },
			FormatException);
		assert.throws(function () { stringType.formatValue("NaN", "int"); }, FormatException);
		assert.throws(function () { stringType.formatValue("d3f.442fs", "float"); },
			FormatException);
	});

	QUnit.test("string parseValue", function (assert) {
		var stringType = new StringType();
		assert.strictEqual(stringType.parseValue(true, "boolean"), "true");
		assert.strictEqual(stringType.parseValue(false, "boolean"), "false");
		assert.strictEqual(stringType.parseValue("true", "string"), "true");
		assert.strictEqual(stringType.parseValue("false", "string"), "false");
		assert.strictEqual(stringType.parseValue("X", "string"), "X");
		assert.strictEqual(stringType.parseValue("", "string"), "");
		assert.strictEqual(stringType.parseValue(-222, "int"), "-222");
		assert.strictEqual(stringType.parseValue(-4.3657, "float"), "-4.3657");

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, stringType, "parseValue", true,
			new ParseException("Don't know how to parse String from untype"));
		checkUnsupportedType(assert, stringType, "parseValue", true);

	});

	QUnit.test("string validateValue", function (assert) {
		var oLogMock = this.mock(Log),
			stringType = new StringType(null, {
				minLength: 3,
				maxLength: 10
			});

		assert.strictEqual(stringType.validateValue("fff"), undefined);
		assert.strictEqual(stringType.validateValue("ffdddddddd"), undefined);
		assert.throws(function () { stringType.validateValue("dd"); }, checkValidateException);
		assert.throws(function () { stringType.validateValue("ddggggggggggg"); },
			checkValidateException);

		stringType = new StringType(null, {
			startsWith: "ab",
			contains: "cd"
		});

		assert.strictEqual(stringType.validateValue("abcccdfff"), undefined);
		assert.strictEqual(stringType.validateValue("abcd"), undefined);
		assert.throws(function () { stringType.validateValue("cdab"); }, checkValidateException);
		assert.throws(function () { stringType.validateValue("abdccsbaab"); },
			checkValidateException);

		stringType = new StringType(null, {
			equals: "ab"
		});

		assert.strictEqual(stringType.validateValue("ab"), undefined);
		assert.throws(function () { stringType.validateValue("cdab"); }, checkValidateException);
		assert.throws(function () { stringType.validateValue("abdaab"); }, checkValidateException);

		stringType = new StringType(null, {
			search: "ab"
		});

		assert.strictEqual(stringType.validateValue("ddabcccdfff"), undefined);
		assert.strictEqual(stringType.validateValue("abcd"), undefined);
		assert.throws(function () { stringType.validateValue("cdb"); }, checkValidateException);
		assert.throws(function () { stringType.validateValue("adccsbba"); },
			checkValidateException);

		stringType = new StringType(null, {
			foo: "ab"
		});

		oLogMock.expects("warning")
			.withExactArgs("Ignoring unknown constraint: 'foo'", null, "sap.ui.model.type.String");

		// code under test
		stringType.validateValue("ab");
	});

[
	{contains : ""},
	// {endsWith : ""}, /* empty string is invalid */
	// {endsWithIgnoreCase : ""}, /* empty string is invalid */
	{equals : ""},
	{minLength : 0},
	{maxLength : 0},
	{maxLength : 10},
	{search : ""}
	// {startsWith : ""}, /* empty string is invalid */
	// {startsWithIgnoreCase : ""} /* empty string is invalid */
].forEach(function (oConstraints, i) {
	QUnit.test("string validateValue with null, success, " + i, function (assert) {
		var oType = new StringType(null, oConstraints);

		assert.strictEqual(oType.validateValue(null), undefined);
	});
});

[
	{constraints : {contains : "ab"}, message : "String.Contains ab"},
	{constraints : {endsWith : "ab"}, message : "String.EndsWith ab"},
	{constraints : {endsWithIgnoreCase : "ab"}, message : "String.EndsWith ab"},
	{constraints : {equals : "ab"}, message : "String.Equals ab"},
	{constraints : {minLength : 3}, message : "String.MinLength 3"},
	{constraints : {search : "ab"}, message : "String.Search"},
	{constraints : {startsWith : "ab"}, message : "String.StartsWith ab"},
	{constraints : {startsWithIgnoreCase : "ab"}, message : "String.StartsWith ab"}
].forEach(function (oFixture, i) {
	QUnit.test("string validateValue with null, exception, #" + i, function (assert) {
		var oType = new StringType(null, oFixture.constraints);

		TestUtils.withNormalizedMessages(function () {
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, oFixture.message);
			}
		});
	});
});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.Time", {
		beforeEach : function() {
			Localization.setLanguage("en-US");
		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("time formatValue", function (assert) {
		var timeType = new TimeType();
		// as date object is locale dependend fill it manually
		var timeValue = UI5Date.getInstance(2003, 1, 1, 16, 58, 49);

		assert.strictEqual(timeType.formatValue(timeValue, "string"), "4:58:49\u202FPM", "format test");

		timeType = new TimeType({ pattern: "HH:mm:ss" });
		assert.strictEqual(timeType.formatValue(timeValue, "string"), "16:58:49", "format test with pattern");

		timeType = new TimeType({ source: { pattern: "HH:mm:ss" }, pattern: "hh-mm" });
		assert.strictEqual(timeType.formatValue("17:01:02", "string"), "05-01", "format test with source pattern");

		timeType = new TimeType({ source: { pattern: "timestamp" }, pattern: "hh-mm-ss" });
		assert.strictEqual(timeType.formatValue(timeValue.getTime(), "string"), "04-58-49", "format test with timestamp");

		assert.strictEqual(timeType.formatValue(null, "string"), "", "format test");
		assert.strictEqual(timeType.formatValue(undefined, "string"), "", "format test");

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, timeType, "formatValue", timeValue.getTime(),
			new FormatException("Don't know how to format Date to untype"));
		checkUnsupportedType(assert, timeType, "formatValue", timeValue.getTime());
	});

	QUnit.test("time parseValue", function (assert) {
		// as date object is locale dependend fill it manually
		var timeValue = UI5Date.getInstance(1970, 0, 1, 16, 58, 49);

		var timeType = new TimeType();
		assert.strictEqual(timeType.parseValue("04:58:49 PM", "string").getTime(), timeValue.getTime(), "parse test");

		timeType = new TimeType({ pattern: "HH:mm:ss" });
		assert.strictEqual(timeType.parseValue("16:58:49", "string").getTime(), timeValue.getTime(), "parse test with pattern");

		timeType = new TimeType({ source: { pattern: "HH:mm_ss" }, pattern: "hh-mm-ss" });
		assert.strictEqual(timeType.parseValue("10-05-15", "string"), "10:05_15", "parse test with source pattern");

		timeType = new TimeType({ source: { pattern: "timestamp" }, pattern: "HH:mm:ss" });
		assert.strictEqual(timeType.parseValue("16:58:49", "string"), timeValue.getTime(), "parse test with timestamp");

		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, timeType, "parseValue", true,
			new ParseException("Don't know how to parse Date from untype"));
		checkUnsupportedType(assert, timeType, "parseValue", true);
		assert.throws(function () { timeType.parseValue(true, "boolean"); }, ParseException, "parse test");
		assert.throws(function () { timeType.parseValue("test", "string"); }, checkParseException, "parse test");
	});

	QUnit.test("time validateValue", function (assert) {
		var timeType = new TimeType({
			source: { pattern: "HH:mm:ss" },
			pattern: "hh-mm-ss"
		}, {
			minimum: "10:00:00",
			maximum: "11:00:00"
		});
		try {
			assert.strictEqual(timeType.validateValue("10:30:00"), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}
		assert.throws(function () { timeType.validateValue("09:30:00"); }, checkValidateException, "validate test");
		assert.throws(function () { timeType.validateValue("11:30:00"); }, checkValidateException, "validate test");
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new TimeType();

		this.mock(oType.oOutputFormat).expects("getPlaceholderText").withExactArgs().returns("~placeholder");

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.TimeInterval", {
		beforeEach : function() {
			Localization.setLanguage("en-US");
		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("TimeInterval formatValue", function (assert) {
		var oTimeIntervalType = new TimeIntervalType();
		var oTime1 = UI5Date.getInstance(2003, 1, 1, 16, 58, 49);
		var oTime2 = UI5Date.getInstance(2003, 1, 1, 17, 0, 0);

		assert.strictEqual(oTimeIntervalType.formatValue([oTime1, oTime2], "string"),
			"4:58:49\u202FPM\u2009\u2013\u20095:00:00\u202FPM", "dates can be formatted as interval");

		oTimeIntervalType = new TimeIntervalType({
			source: {}
		});
		assert.strictEqual(oTimeIntervalType.formatValue(["4:58:49 PM", "5:00:00 PM"], "string"),
			"4:58:49\u202FPM\u2009\u2013\u20095:00:00\u202FPM", "dates can be formatted as interval");
	});

	QUnit.test("TimeInterval parseValue", function (assert) {
		var oTimeIntervalType = new TimeIntervalType();
		var oTime1 = UI5Date.getInstance(1970, 0, 1, 16, 58, 49);
		var oTime2 = UI5Date.getInstance(1970, 0, 1, 17, 0, 0);

		var aTimeIntervalResult = oTimeIntervalType.parseValue("4:58:49 PM \u2013  5:00:00 PM", "string");

		assert.deepEqual([aTimeIntervalResult[0].getTime(), aTimeIntervalResult[1].getTime()], [oTime1.getTime(), oTime2.getTime()], "Interval string can be parsed into an array of dates");

		oTimeIntervalType = new TimeIntervalType({
			source: {}
		});

		assert.deepEqual(oTimeIntervalType.parseValue("4:58:49 PM \u2013 5:00:00 PM", "string"),
			["4:58:49\u202FPM", "5:00:00\u202FPM"], "Interval string can be parsed into an array of formatted dates");
	});

	QUnit.test("TimeInterval validateValue", function (assert) {
		var oTime1 = UI5Date.getInstance(1970, 0, 1, 16, 58, 49);
		var oTime2 = UI5Date.getInstance(1970, 0, 1, 17, 0, 0);
		var oTimeIntervalType = new TimeIntervalType({}, {
			minimum: oTime1,
			maximum: oTime2
		});

		try {
			assert.strictEqual(oTimeIntervalType.validateValue([oTime1, oTime2]), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "validate test fails");
		}
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new TimeIntervalType();

		this.mock(oType.oOutputFormat).expects("getPlaceholderText").withExactArgs().returns("~placeholder");

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.type.Unit", {
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

	//*********************************************************************************************
	QUnit.test("constructor: set bShowNumber and bShowMeasure", function (assert) {
		checkShowMeasureShowNumberDefaulting(assert, UnitType);
	});

	//*********************************************************************************************
[
	{preserveDecimals : true},
	{preserveDecimals : "yes"},
	{preserveDecimals : undefined},
	{preserveDecimals : null},
	{preserveDecimals : false},
	{preserveDecimals : true, style : "short"},
	{preserveDecimals : "yes", style : "short"},
	{preserveDecimals : undefined, style : "short"},
	{preserveDecimals : null, style : "short"},
	{preserveDecimals : false, style : "short"},
	{preserveDecimals : true, style : "long"},
	{preserveDecimals : "yes", style : "long"},
	{preserveDecimals : undefined, style : "long"},
	{preserveDecimals : null, style : "long"},
	{preserveDecimals : false, style : "long"}
].forEach(function (oFormatOptions, i) {
	QUnit.test("setFormatOptions: oFormatOptions.preserveDecimals given; #" + i, function (assert) {
		var oType = {
				_clearInstances : function () {},
				_createInputFormat : function () {}
			};

		this.mock(Log).expects("warning").never();
		this.mock(oType).expects("_clearInstances").withExactArgs();
		this.mock(oType).expects("_createInputFormat").withExactArgs();

		// code under test
		UnitType.prototype.setFormatOptions.call(oType, oFormatOptions);

		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions);
		assert.deepEqual(oType.oFormatOptions, oFormatOptions);
	});
});

	//*********************************************************************************************
[{
	formatOption : {foo : "bar"},
	result : {foo : "bar", preserveDecimals : true}
}, {
	formatOption : {foo : "bar", style : "standard"},
	result : {foo : "bar", preserveDecimals : true, style : "standard"}
}, {
	formatOption : {foo : "bar", style : "short"},
	result : {foo : "bar", style : "short"}
}, {
	formatOption : {foo : "bar", style : "long"},
	result : {foo : "bar", style : "long"}
}].forEach(function (oFixture, i) {
	QUnit.test("setFormatOptions: no preserveDecimals, #" + i, function (assert) {
		var oType = {
				_clearInstances : function () {},
				_createInputFormat : function () {}
			};

		this.mock(Log).expects("warning").never();
		this.mock(oType).expects("_clearInstances").withExactArgs();
		this.mock(oType).expects("_createInputFormat").withExactArgs();

		// code under test
		UnitType.prototype.setFormatOptions.call(oType, oFixture.formatOption);

		assert.notStrictEqual(oType.oFormatOptions, oFixture.formatOption);
		assert.deepEqual(oType.oFormatOptions, oFixture.result);
	});
});

	QUnit.test("unit formatValue", function (assert) {
		var unitType = new UnitType();
		assert.strictEqual(unitType.formatValue([22, "duration-hour"], "string"), "22 hr", "format test");
		assert.strictEqual(unitType.formatValue([22, "speed-mile-per-hour"], "string"), "22 mph", "format test");
		assert.strictEqual(unitType.formatValue([-6622.333, "duration-hour"], "string"), "-6,622.333 hr", "format test");
		assert.strictEqual(unitType.formatValue([1.0, "duration-hour"], "string"), "1 hr", "format test");
		assert.strictEqual(unitType.formatValue([1.0000, "duration-hour"], "string"), "1 hr", "format test");
		assert.strictEqual(unitType.formatValue([1.0000, "electric-ohm"], "string"), "1 Ω", "format test");

		assert.strictEqual(unitType.formatValue(null, "string"), null, "format test");
		assert.strictEqual(unitType.formatValue([null, "duration-hour"], "string"), null, "format test");
		assert.strictEqual(unitType.formatValue([1, null], "string"), "1", "format test");

		assert.throws(function () { unitType.formatValue(22.0, "int"); }, FormatException, "format test");
		assert.throws(function () { unitType.formatValue(22.0, "float"); }, FormatException, "format test");
		assert.throws(function () { unitType.formatValue(22.0, "untype"); }, FormatException, "format test");
	});

	//*********************************************************************************************
[
	{formatOptions : {}, result : null},
	{formatOptions : {showNumber : true}, result : null},
	{formatOptions : {showNumber : false}, result : "~formatted"}
].forEach(function (oFixture, i) {
	[null, undefined].forEach(function (vInputValue) {
	var sTitle = "formatValue: showNumber=false skips invalid number check; " + i + ", "
			+ vInputValue;

	QUnit.test(sTitle, function (assert) {
		var oOutputFormat = {format : function () {}},
			bSkipFormat = oFixture.result === null,
			oType = new UnitType(oFixture.formatOptions),
			aValues = [vInputValue, "duration-hour"];

		this.mock(oType).expects("getPrimitiveType").withExactArgs("string")
			.exactly(bSkipFormat ? 0 : 1)
			.returns("string");
		this.mock(oType).expects("extractArguments").withExactArgs(sinon.match.same(aValues))
			.exactly(bSkipFormat ? 0 : 1)
			.returns("~aDynamicValues");
		this.mock(oType).expects("_getInstance").withExactArgs("~aDynamicValues", "duration-hour")
			.exactly(bSkipFormat ? 0 : 1)
			.returns(oOutputFormat);
		this.mock(oOutputFormat).expects("format").withExactArgs(sinon.match.same(aValues))
			.exactly(bSkipFormat ? 0 : 1)
			.returns("~formatted");

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "string"), oFixture.result);
	});
	});
});

	QUnit.test("unit parseValue", function (assert) {
		var unitType = new UnitType();

		assert.deepEqual(unitType.parseValue("3333.555 Ω", "string"), [3333.555, "electric-ohm"], "parse test");
		assert.deepEqual(unitType.parseValue("3.555 hr", "string"), [3.555, "duration-hour"], "parse test");
		assert.deepEqual(unitType.parseValue("-3.555 mph", "string"), [-3.555, "speed-mile-per-hour"], "parse test");

		// The next parseValue should throw exception only when strict mode is set to true
		// Currently the Unit type has a strict check even when strict mode isn't enabled,
		//  this will be changed once the strict mode is implemented in
		//  sap.ui.core.format.NumberFormat
		assert.throws(function () { unitType.parseValue("3333", "string"); }, ParseException, "parse test");
		/** @deprecated As of 1.120, with UI5 2.0 unsupported types throw an Error */
		checkUnsupportedTypeOld(assert, unitType, "parseValue", true,
			new ParseException("Don't know how to parse Unit from untype"));
		checkUnsupportedType(assert, unitType, "parseValue", true);
		assert.throws(function () { unitType.parseValue(true, "boolean"); }, ParseException, "parse test");
		assert.throws(function () { unitType.parseValue("test", "string"); }, ParseException, "parse test");
	});

[
	{oFormatOptions : undefined, aResult : []},
	{oFormatOptions : {}, aResult : []},
	{oFormatOptions : {showMeasure : true}, aResult : []},
	{oFormatOptions : {showMeasure : false}, aResult : [1]},
	{oFormatOptions : {showNumber : true}, aResult : []},
	{oFormatOptions : {showNumber : false}, aResult : [0]}
].forEach(function (oFixture, i) {
	QUnit.test("Unit: getPartsIgnoringMessages, #" + i, function (assert) {
		var oUnitType = new UnitType(oFixture.oFormatOptions);

		// code under test
		assert.deepEqual(oUnitType.getPartsIgnoringMessages(), oFixture.aResult);
	});
});

	QUnit.test("parseValue: format option 'showNumber'; only enter the unit", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				// code under test
				new UnitType().parseValue("mph", "string");
			}, new ParseException("Unit.Invalid"));

			assert.throws(function () {
				// code under test
				new UnitType({showNumber : true}).parseValue("mph", "string");
			}, new ParseException("Unit.Invalid"));
		});

		// code under test
		assert.deepEqual(new UnitType({showNumber : false}).parseValue("mph", "string"),
			[undefined, "speed-mile-per-hour"]);
	});

	QUnit.test("unit format and parse - simple", function (assert) {
		var oType = new UnitType();

		// format and parse "kg" (unit-1)
		assert.strictEqual(oType.formatValue([100, "mass-kilogram"], "string"), "100 kg");
		assert.deepEqual(oType.parseValue("100 kg", "string"), [100, "mass-kilogram"]);

		// format and parse "Ω" (unit-2)
		assert.strictEqual(oType.formatValue([30, "electric-ohm"], "string"), "30 Ω");
		assert.deepEqual(oType.parseValue("30 Ω", "string"), [30, "electric-ohm"]);
	});

	QUnit.test("unit format and parse - custom units (local)", function (assert) {
		var oType = new UnitType({
			"customUnits": {
				"electric-inductance": {
					"displayName": "henry",
					"unitPattern-count-one": "{0} H",
					"unitPattern-count-other": "{0} H",
					"perUnitPattern": "{0}/H",
					"decimals": 2,
					"precision": 5
				}
			}
		});

		// format and parse invalid unit
		assert.strictEqual(oType.formatValue([100, "mass-kilogram"], "string"), "100 mass-kilogram", "Format of unknown unit returns number and measure (just as NumberFormat returns it)");
		assert.throws(function () {
				oType.parseValue("100 kg", "string");
			},
			ParseException,
			"ParseException is thrown for wrong unit");

		// format and parse valid unit
		assert.strictEqual(oType.formatValue([200.535, "electric-inductance"], "string"), "200.535 H", "precision 5 is respected (rounded)");
		assert.deepEqual(oType.parseValue("200.5123 H", "string"), [200.5123, "electric-inductance"], "parsing is valid");
	});

	QUnit.test("unit format and parse - custom units (global)", function (assert) {
		var oConfigObject = {
			"lebkuchen": {
				"unitPattern-count-one": "{0} LK",
				"unitPattern-count-many": "{0} LKs",
				"unitPattern-count-other": "{0} LKs",
				"decimals": 3
			}
		};
		Formatting.setCustomUnits(oConfigObject);

		var oType = new UnitType();

		// format and parse valid unit
		assert.strictEqual(oType.formatValue([100, "mass-kilogram"], "string"), "100 kg", "Format: Standard Unit shines through global custom units");
		assert.deepEqual(oType.parseValue("100 kg", "string"), [100, "mass-kilogram"], "Parse: Standard Unit shines through global custom units");

		// format and parse valid unit
		assert.strictEqual(oType.formatValue([200.57, "lebkuchen"], "string"), "200.570 LKs", "decimals '3' is respected");
		assert.deepEqual(oType.parseValue("200.5123 LKs", "string"), [200.5123, "lebkuchen"], "parsing is valid");
		Formatting.setCustomUnits(undefined);
	});

	QUnit.test("unit format and parse - custom units (global & local)", function (assert) {
		// global config
		var oConfigObject = {
			"lebkuchen": {
				"unitPattern-count-one": "{0} LK",
				"unitPattern-count-many": "{0} LKs",
				"unitPattern-count-other": "{0} LKs",
				"decimals": 3
			}
		};
		Formatting.setCustomUnits(oConfigObject);

		// local config  -->  hides global config
		var oType = new UnitType({
			"customUnits": {
				"electric-inductance": {
					"displayName": "henry",
					"unitPattern-count-one": "{0} H",
					"unitPattern-count-other": "{0} H",
					"perUnitPattern": "{0}/H",
					"decimals": 2,
					"precision": 4
				}
			}
		});

		// format and parse invalid unit (excluded by local config)
		assert.strictEqual(oType.formatValue([100, "mass-kilogram"], "string"), "100 mass-kilogram", "Format of unknown unit leads to empty string (just as NumberFormat returns it)");
		assert.throws(function () {
				oType.parseValue("100 kg", "string");
			},
			ParseException,
			"ParseException is thrown for wrong unit");

		// format and parse invalid unit (excluded by local config)
		assert.strictEqual(oType.formatValue([123.4, "lebkuchen"], "string"), "123.4 lebkuchen", "Lebkuchen is not formatted (excluded by local configuration)");
		assert.throws(function () {
			oType.parseValue("1234.56 LKs", "string");
		},
		ParseException,
		"ParseException is thrown for wrong unit");

		// format and parse valid unit
		assert.strictEqual(oType.formatValue([200.575, "electric-inductance"], "string"), "200.575 H", "precision 4 is respected (rounded)");
		assert.deepEqual(oType.parseValue("200.5123 H", "string"), [200.5123, "electric-inductance"], "parsing is valid");

		Formatting.setCustomUnits(undefined);
	});

	QUnit.test("unit validateValue - minimum and maximum value constraints", function (assert) {
		var unitType = new UnitType(null, {
			minimum: 3,
			maximum: 10
		});

		//values are within range therefore no error should be thrown
		try {
			assert.strictEqual(unitType.validateValue([3.0, "duration-hour"]), undefined, "validate test");
			assert.strictEqual(unitType.validateValue([3.01, "electric-ohm"]), undefined, "validate test");
			assert.strictEqual(unitType.validateValue([10, "speed-mile-per-hour"]), undefined, "validate test");
		} catch (e) {
			assert.ok(false, "one of the validation tests failed please check");
		}

		//values are out of range
		assert.throws(function () { unitType.validateValue([2.99999, "electric-ohm"]); }, ValidateException, "validate test");
		assert.throws(function () { unitType.validateValue([10.0000001, "duration-hour"]); }, ValidateException, "validate test");
	});

	QUnit.test("unit type - formatValue with showMeasure false", function (assert) {
		var unitType = new UnitType({
			showMeasure: false
		});

		assert.strictEqual(unitType.formatValue([22, "electric-ohm"], "string"), "22", "format test");
		assert.strictEqual(unitType.formatValue([-6622.333, "electric-ohm"], "string"), "-6,622.333", "format test");
		assert.strictEqual(unitType.formatValue([-6622.339, "duration-hour"], "string"), "-6,622.339", "format test");
		assert.strictEqual(unitType.formatValue([1.0, "electric-ohm"], "string"), "1", "format test");
		assert.strictEqual(unitType.formatValue([1.0000, "speed-mile-per-hour"], "string"), "1", "format test");
		assert.strictEqual(unitType.formatValue([1.009, "duration-hour"], "string"), "1.009", "format test");
		assert.strictEqual(unitType.formatValue([1.00001, "electric-ohm"], "string"), "1.00001", "format test");
	});

	QUnit.test("unit type - formatValue with maxFractionDigits 2", function (assert) {
		var unitType = new UnitType({
			maxFractionDigits: 2
		});

		assert.strictEqual(unitType.formatValue([22, "electric-ohm"], "string"), "22 Ω", "format test");
		assert.strictEqual(unitType.formatValue([-6622.333, "electric-ohm"], "string"), "-6,622.333 Ω", "format test");
		assert.strictEqual(unitType.formatValue([-6622.339, "duration-hour"], "string"), "-6,622.339 hr", "format test");
		assert.strictEqual(unitType.formatValue([1.0, "electric-ohm"], "string"), "1 Ω", "format test");
		assert.strictEqual(unitType.formatValue([1.0000, "speed-mile-per-hour"], "string"), "1 mph", "format test");
		assert.strictEqual(unitType.formatValue([1.009, "duration-hour"], "string"), "1.009 hr", "format test");
		assert.strictEqual(unitType.formatValue([1.00001, "electric-ohm"], "string"), "1.00001 Ω", "format test");
	});

	QUnit.test("unit formatOptions.source", function (assert) {
		var unitType = new UnitType({
			source: {}
		});

		assert.strictEqual(unitType.parseValue("3333 hr", "string"), "3333 hr", "parse test");
		assert.strictEqual(unitType.parseValue("3333.555 Ω", "string"), "3333.555 Ω", "parse test");
		assert.strictEqual(unitType.parseValue("3.555 Ω", "string"), "3.555 Ω", "parse test");
		assert.strictEqual(unitType.parseValue("-3.555 mph", "string"), "-3.555 mph", "parse test");

		assert.strictEqual(unitType.formatValue("22 hr", "string"), "22 hr", "format test");
		assert.strictEqual(unitType.formatValue("-6622.333 Ω", "string"), "-6,622.333 Ω", "format test");
		assert.strictEqual(unitType.formatValue("-6622.339 mph", "string"), "-6,622.339 mph", "format test");
	});

	QUnit.test("unit formatOptions.source and validateValue", function (assert) {
		//source format option is used to parse the value before formatting it,
		//specifying an empty object is the same as not specifying source options
		var unitType = new UnitType({
			source: {}
		}, {
				minimum: 3,
				maximum: 10,
				decimals: 10
			});
		try {
			assert.strictEqual(unitType.validateValue("3.00 hr"), undefined, "validate test");
			assert.strictEqual(unitType.validateValue("3.01 Ω"), undefined, "validate test");
			assert.strictEqual(unitType.validateValue("10 mph"), undefined, "validate test");
			assert.strictEqual(unitType.validateValue("3.0000000001 mph"), undefined, "validate test 10 digits");
		} catch (e) {
			assert.ok(!e, "one of the validation tests failed please check");
		}
		assert.throws(function () { unitType.validateValue("2.99999 Ω"); }, ValidateException, "smaller than min");
		assert.throws(function () { unitType.validateValue("10.0000001 hr"); }, ValidateException, "bigger than max");
		assert.throws(function () { unitType.validateValue("3.00000000000001 hr"); }, ValidateException, "more digits than decimals (14)");
		assert.throws(function () { unitType.validateValue("3.00000000001 hr"); }, ValidateException, "more digits than decimals (11)");
	});


	QUnit.test("unit dynamic values", function (assert) {
		var MeterType = UnitType.extend("sap.ui.core.test.MeterType", {
			constructor: function (oFormatOptions, oConstraints) {
				UnitType.apply(this, [oFormatOptions, oConstraints, ["decimals"]]);
			},

			//check dynamic decimals
			validateValue: function (vValue) {
				//call super validateValue
				UnitType.prototype.validateValue.apply(this, arguments);

				var oBundle = Library.getResourceBundleFor("sap.ui.core"),
					aValues = vValue,
					iValue;
				if (this.oInputFormat) {
					aValues = this.oInputFormat.parse(vValue);
				}
				iValue = aValues[0];

				//check decimals
				if (this.oOutputFormat) {
					var iDecimals = this.oOutputFormat.oFormatOptions.decimals;

					var tempValue = NumberFormat._shiftDecimalPoint(iValue, iDecimals);
					if (Math.floor(tempValue) !== tempValue) {
						throw new ValidateException(oBundle.getText("Unit.Decimals", [iDecimals]), ["decimals"]);
					}
				}
			}
		});

		var oMeterType = new MeterType();
		var oMeterTypeInstanceSpy = this.spy(NumberFormat, "getUnitInstance");
		//4 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 4], "string"), "123.123123 m", "format 4 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse 4 digits meters expected");
		oMeterType.validateValue([123.1231, "length-meter"]);
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 2, "2 instance because 2 decimal option is provided (4)");

		// 5 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 5], "string"), "123.123123 m", "format 5 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.12312 m", "string"), [123.12312, "length-meter"], "parse 5 digits meters expected");
		oMeterType.validateValue([123.12312, "length-meter"]);

		assert.strictEqual(oMeterType.formatValue([123.1, "length-meter", 5], "string"), "123.10000 m", "small number format 5 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.10000 m", "string"), [123.1, "length-meter"], "small number parse 5 digits meters expected");
		oMeterType.validateValue([123.1, "length-meter"]);

		assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 4, "4 instances because 4 different decimal options are provided");

		// 6 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 6], "string"), "123.123123 m", "format 6 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.123123 m", "string"), [123.123123, "length-meter"], "parse 6 digits meters expected");
		oMeterType.validateValue([123.123123, "length-meter"]);

		assert.strictEqual(oMeterType.formatValue([123.1, "length-meter", 6], "string"), "123.100000 m", "small number format 6 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.100000 m", "string"), [123.1, "length-meter"], "small number parse 6 digits meters expected");
		oMeterType.validateValue([123.1, "length-meter"]);

		assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 6, "6 instances because 6 different decimal options are provided");

		try {
			TestUtils.withNormalizedMessages(function () {
				oMeterType.validateValue([123.100000000001, "length-meter"]);
			});
			assert.ok(false, "validation should fail as too many digits");
		} catch (e) {
			assert.ok(e);
			assert.strictEqual(e.name, "ValidateException");
			assert.strictEqual(e.message, "Unit.Decimals 6");
		}
	});

	QUnit.test("Unit: Dynamic values & unit overdefiniton via Configuration (decimals)", function (assert) {
		// overwrite the length-meter unit, and define a decimals value
		var oConfigObject = {
			"length-meter": {
				"unitPattern-count-one": "{0} m",
				"unitPattern-count-many": "{0} m",
				"unitPattern-count-other": "{0} m",
				"decimals": 3
			}
		};
		Formatting.setCustomUnits(oConfigObject);

		// new Meter type
		var MeterType = UnitType.extend("sap.ui.core.test.MeterType", {
			constructor: function (oFormatOptions, oConstraints) {
				UnitType.apply(this, [oFormatOptions, oConstraints, ["decimals"]]);
			}
		});

		var oMeterType = new MeterType();
		var oMeterTypeInstanceSpy = this.spy(NumberFormat, "getUnitInstance");

		// zero
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 0], "string"), "123.123123 m", "format with decimals 3 expected");
		assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 2, "2 instance because 2 decimal value is used");

		// empty
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", undefined], "string"), "123.123123 m", "format with decimals 3 expected");
		assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 4, "4 instance because 4 decimal value is used");

		//4 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 4], "string"), "123.123123 m", "format 4 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse 4 digits meters expected");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 6, "6 instance because 6 decimal option is provided (4)");

		// 5 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 5], "string"), "123.123123 m", "format 5 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.12312 m", "string"), [123.12312, "length-meter"], "parse 5 digits meters expected");

		assert.strictEqual(oMeterType.formatValue([123.1, "length-meter", 5], "string"), "123.10000 m", "small number format 5 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.10000 m", "string"), [123.1, "length-meter"], "small number parse 5 digits meters expected");

		assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 8, "8 instances because 8 different decimal options are provided");

		// 6 digits
		assert.strictEqual(oMeterType.formatValue([123.1231236, "length-meter", 6], "string"), "123.1231236 m", "format 6 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.12312345 m", "string"), [123.12312345, "length-meter"], "parse 6 digits meters expected");

		assert.strictEqual(oMeterType.formatValue([123.1, "length-meter", 6], "string"), "123.100000 m", "small number format 6 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.100000 m", "string"), [123.1, "length-meter"], "small number parse 6 digits meters expected");

		assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 10, "10 instances because 10 different decimal options are provided");

		Formatting.setCustomUnits(undefined);
	});

	QUnit.test("Unit: Dynamic values & unit overdefiniton via Configuration (precision)", function (assert) {
		// overwrite the length-meter unit, and define a decimals value
		var oConfigObject = {
			"length-meter": {
				"unitPattern-count-one": "{0} m",
				"unitPattern-count-many": "{0} m",
				"unitPattern-count-other": "{0} m",
				"precision": 4
			}
		};
		Formatting.setCustomUnits(oConfigObject);

		// new Meter type
		var MeterType = UnitType.extend("sap.ui.core.test.MeterType", {
			constructor: function (oFormatOptions, oConstraints) {
				UnitType.apply(this, [oFormatOptions, oConstraints, ["precision"]]);
			}
		});

		var oMeterType = new MeterType();
		var oMeterTypeInstanceSpy = this.spy(NumberFormat, "getUnitInstance");

		// empty
		assert.strictEqual(oMeterType.formatValue([123.163123, "length-meter", 0], "string"), "123.163123 m", "format with precision 4 expected");
		assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 2, "2 instance because 2 precision value is used");

		// empty
		assert.strictEqual(oMeterType.formatValue([123.163123, "length-meter", undefined], "string"), "123.163123 m", "format with precision 4 expected");
		assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 4, "4 instance because 4 precision value is used");

		//4 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 3], "string"), "123.123123 m", "format with precision 3 expected");
		assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 6, "6 instances because 6 different precision values are used");

		// 5 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 2], "string"), "123.123123 m", "format 5 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.12312 m", "string"), [123.12312, "length-meter"], "parse 5 digits meters expected");

		assert.strictEqual(oMeterType.formatValue([123.1, "length-meter", 2], "string"), "123.1 m", "small number format 5 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.10000 m", "string"), [123.1, "length-meter"], "small number parse 5 digits meters expected");

		assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 8, "8 instances because 8 different precision options are provided");

		// 6 digits
		assert.strictEqual(oMeterType.formatValue([123.123123, "length-meter", 1], "string"), "123.123123 m", "format 6 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.123123 m", "string"), [123.123123, "length-meter"], "parse 6 digits meters expected");

		assert.strictEqual(oMeterType.formatValue([123.1, "length-meter", 1], "string"), "123.1 m", "small number format 6 digits meters expected");
		assert.deepEqual(oMeterType.parseValue("123.100000 m", "string"), [123.1, "length-meter"], "small number parse 6 digits meters expected");

		assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
		assert.strictEqual(oMeterTypeInstanceSpy.callCount, 10, "10 instances because 10 different precision options are provided");

		Formatting.setCustomUnits(undefined);
	});

	QUnit.test("Multiple Unit-Instances with bound custom units and other distinct format options", function (assert) {
		// new Meter type
		var CustomUnitType = UnitType.extend("sap.ui.core.test.CustomUnitType", {
			constructor: function (oFormatOptions, oConstraints) {
				UnitType.apply(this, [oFormatOptions, oConstraints, ["customUnits"]]);
			}
		});

		var oCustomUnitConfig = {
			"length-meter": {
				"unitPattern-count-one": "{0} m",
				"unitPattern-count-many": "{0} m",
				"unitPattern-count-other": "{0} m",
				"decimals": 4
			}
		};

		var oCustomUnitTypeInstanceSpy = this.spy(NumberFormat, "getUnitInstance");

		var oCustomUnitType = new CustomUnitType(/* showMeasure is true by default*/);
		var oCustomUnitType2 = new CustomUnitType({showMeasure: false});
		var oCustomUnitType3 = new CustomUnitType({showMeasure: false});

		// straight forward case
		assert.strictEqual(oCustomUnitType.formatValue([123.456789, "length-meter", oCustomUnitConfig], "string"), "123.456789 m");
		assert.strictEqual(oCustomUnitTypeInstanceSpy.callCount, 1, "1st instance created");

		// additional format options
		assert.strictEqual(oCustomUnitType2.formatValue([123.456789, "length-meter", oCustomUnitConfig], "string"), "123.456789", "formatted value respects the 'decimals' of custom unit");
		assert.strictEqual(oCustomUnitTypeInstanceSpy.callCount, 2, "2nd instance created, because of different format options");

		assert.strictEqual(oCustomUnitType3.formatValue([123.456789, "length-meter", oCustomUnitConfig], "string"), "123.456789", "formatted value respects the 'decimals' of custom unit");
		assert.strictEqual(oCustomUnitTypeInstanceSpy.callCount, 2, "No additional instance is created, 2nd instance is taken from cache");
	});

	QUnit.test("Parse/Format emptyString values", function (assert) {
		// default: "" --> NaN
		var oUnitType = new UnitType(/* emptyString is NaN by default */);

		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oUnitType.parseValue("", "string");
			});
		}, new ParseException("Unit.Invalid"));

		// "" --> NaN
		var oUnitType2 = new UnitType({emptyString: NaN});
		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oUnitType2.parseValue("", "string");
			});
		}, new ParseException("Unit.Invalid"));

		// "" --> ""
		var oUnitType3 = new UnitType({emptyString: ""});
		assert.deepEqual(oUnitType3.parseValue("", "string"), ["", undefined], "Empty string is returned");

		// "" --> null
		var oUnitType4 = new UnitType({emptyString: null});
		assert.deepEqual(oUnitType4.parseValue("", "string"), [null, undefined], "null is returned");

		// "" --> 0
		var oUnitType5 = new UnitType({emptyString: 0});
		assert.deepEqual(oUnitType5.parseValue("", "string"), [0, undefined], "0 is returned");
	});

	QUnit.test("Parse/Format emptyString values (parseAsString)", function (assert) {
		// default: "" --> "NaN"
		var oUnitType = new UnitType({parseAsString: true /* emptyString is NaN by default */});

		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oUnitType.parseValue("", "string");
			});
		}, new ParseException("Unit.Invalid"));

		// "" --> "NaN"
		var oUnitType2 = new UnitType({emptyString: NaN, parseAsString: true});
		assert.throws(function () {
			TestUtils.withNormalizedMessages(function () {
				oUnitType2.parseValue("", "string");
			});
		}, new ParseException("Unit.Invalid"));

		// "" --> ""
		var oUnitType3 = new UnitType({emptyString: "", parseAsString: true});
		assert.deepEqual(oUnitType3.parseValue("", "string"), ["", undefined], "Empty string is returned");

		// "" --> null
		var oUnitType4 = new UnitType({emptyString: null, parseAsString: true});
		assert.deepEqual(oUnitType4.parseValue("", "string"), [null, undefined], "null is returned");

		// "" --> 0
		var oUnitType5 = new UnitType({emptyString: 0, parseAsString: true});
		assert.deepEqual(oUnitType5.parseValue("", "string"), ["0", undefined], "0 is returned");
	});

	QUnit.test("unit parseValue with strict mode - CLDR (showMeasure=true)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var unitType = new UnitType({
			strictParsing: true,
			showMeasure: true
		});
		// OK
		assert.deepEqual(unitType.parseValue("3333.555 Ω", "string"), [3333.555, "electric-ohm"], "parse valid input");

		// null value
		assert.throws(function () { unitType.parseValue(null, "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parsing of null value under showMeature=true in strict mode results in exception");
		// undefined value
		assert.throws(function () { unitType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parsing of undefined value under showMeature=true in strict mode results in exception");
		// 0 value
		assert.throws(function () { unitType.parseValue(0, "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse of 0 value under showMeature=true in strict mode results in exception");
		// unknown unit
		assert.throws(function () { unitType.parseValue("3333.555 FOO", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string with unknown unit under showMeature=true in strict mode results in exception");
		// ambiguous unit
		assert.throws(function () { unitType.parseValue("3333.555 c", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string with ambiguous unit under showMeature=true in strict mode results in exception");
		// no unit
		assert.throws(function () { unitType.parseValue("3333.555", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string without unit under showMeature=true in strict mode results in exception");
		// no value
		assert.throws(function () { unitType.parseValue("kg", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string with only unit under showMeature=true in strict mode results in exception");
		// no value and no valid unit
		assert.throws(function () { unitType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a random string under showMeature=true in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { unitType.parseValue("", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse empty string under showMeature=true in strict mode results in exception");

		// empty string is set to ""
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: true,
			emptyString: ""
		});
		assert.deepEqual(unitType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: true,
			emptyString: 0
		});
		assert.deepEqual(unitType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

	QUnit.test("unit parseValue with strict mode - CLDR (showMeasure=false)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var unitType = new UnitType({
			strictParsing: true,
			showMeasure: false
		});
		// OK
		assert.deepEqual(unitType.parseValue("3333.555", "string"), [3333.555, undefined], "parse valid input");

		// null value
		assert.throws(function () { unitType.parseValue(null, "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parsing of null value under showMeasure=false in strict mode results in exception");
		// undefined value
		assert.throws(function () { unitType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parsing of undefined value under showMeasure=false in strict mode results in exception");
		// 0 value
		assert.throws(function () { unitType.parseValue(0, "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse of 0 value under showMeasure=false in strict mode results in exception");
		// unknown unit
		assert.throws(function () { unitType.parseValue("3333.555 FOO", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with unknown unit under showMeasure=false in strict mode results in exception");
		// ambiguous unit
		assert.throws(function () { unitType.parseValue("3333.555 c", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with ambiguous unit under showMeasure=false in strict mode results in exception");
		// known unit
		assert.throws(function () { unitType.parseValue("3333.555 Ω", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with known unit under showMeasure=false in strict mode results in exception");
		// no value
		assert.throws(function () { unitType.parseValue("kg", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with only unit under showMeasure=false in strict mode results in exception");
		// no value and no valid unit
		assert.throws(function () { unitType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a random string under showMeasure=false in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { unitType.parseValue("", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse empty string under showMeasure=false in strict mode results in exception");

		// empty string is set to ""
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: false,
			emptyString: ""
		});
		assert.deepEqual(unitType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: false,
			emptyString: 0
		});
		assert.deepEqual(unitType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

	QUnit.test("unit parseValue with strict mode - Custom (showMeasure=true)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var mCustomUnits = {
			"zomb": {
				"displayName": "ZOMBIES!!",
				"unitPattern-count-one": "{0} Zombie...",
				"unitPattern-count-other": "{0} Zombies!!"
			},
			"OR": {
				"displayName": "Orange",
				"unitPattern-count-one": "{0} Orange",
				"unitPattern-count-other": "{0} Oranges"
			},
			"Citrus": {
				"displayName": "Orange",
				"unitPattern-count-one": "{0} Orange",
				"unitPattern-count-other": "{0} Oranges"
			}
		};

		var unitType = new UnitType({
			strictParsing: true,
			showMeasure: true,
			customUnits: mCustomUnits
		});

		// OK
		assert.deepEqual(unitType.parseValue("1 Zombie...", "string"), [1, "zomb"], "parse valid input: Zombie... (single)");
		assert.deepEqual(unitType.parseValue("123.45 Zombies!!", "string"), [123.45, "zomb"], "parse valid input: Zombies!! (multiple)");

		// null value
		assert.throws(function () { unitType.parseValue(null, "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parsing of null value under showMeature=true in strict mode results in exception");
		// undefined value
		assert.throws(function () { unitType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parsing of undefined value under showMeature=true in strict mode results in exception");
		// 0 value
		assert.throws(function () { unitType.parseValue(0, "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse of 0 value under showMeature=true in strict mode results in exception");
		// unknown unit
		assert.throws(function () { unitType.parseValue("3333.555 FOO", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string with unknown unit under showMeature=true in strict mode results in exception");
		// ambiguous unit
		assert.throws(function () { unitType.parseValue("3333.555 Oranges", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string with ambiguous unit under showMeature=true in strict mode results in exception");
		// no unit
		assert.throws(function () { unitType.parseValue("3333.555", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string without unit under showMeature=true in strict mode results in exception");
		// no value
		assert.throws(function () { unitType.parseValue("kg", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a string with only unit under showMeature=true in strict mode results in exception");
		// no value and no valid unit
		assert.throws(function () { unitType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse a random string under showMeature=true in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { unitType.parseValue("", "string"); }, new ParseException(oBundle.getText("Unit.Invalid")), "parse empty string under showMeature=true in strict mode results in exception");

		// empty string is set to ""
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: true,
			customUnits: mCustomUnits,
			emptyString: ""
		});
		assert.deepEqual(unitType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: true,
			customUnits: mCustomUnits,
			emptyString: 0
		});
		assert.deepEqual(unitType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

	QUnit.test("unit parseValue with strict mode - Custom (showMeasure=false)", function (assert) {
		var oBundle = Library.getResourceBundleFor("sap.ui.core");
		var mCustomUnits = {
			"zomb": {
				"displayName": "ZOMBIES!!",
				"unitPattern-count-one": "{0} Zombie...",
				"unitPattern-count-other": "{0} Zombies!!"
			},
			"OR": {
				"displayName": "Orange",
				"unitPattern-count-one": "{0} Orange",
				"unitPattern-count-other": "{0} Oranges"
			},
			"Citrus": {
				"displayName": "Orange",
				"unitPattern-count-one": "{0} Orange",
				"unitPattern-count-other": "{0} Oranges"
			}
		};
		var unitType = new UnitType({
			strictParsing: true,
			showMeasure: false,
			customUnits: mCustomUnits
		});

		// OK
		assert.deepEqual(unitType.parseValue("123.45", "string"), [123.45, undefined], "parse valid input, no unit given");

		// null value
		assert.throws(function () { unitType.parseValue(null, "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parsing of null value under showMeature=true in strict mode results in exception");
		// undefined value
		assert.throws(function () { unitType.parseValue(undefined, "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parsing of undefined value under showMeature=true in strict mode results in exception");
		// 0 value
		assert.throws(function () { unitType.parseValue(0, "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse of 0 value under showMeature=true in strict mode results in exception");
		// valid unit
		assert.throws(function () { unitType.parseValue("3333.555 Zombies!!", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with a valid unit under showMeature=true in strict mode results in exception");
		// unknown unit
		assert.throws(function () { unitType.parseValue("3333.555 FOO", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with unknown unit under showMeature=true in strict mode results in exception");
		// ambiguous unit
		assert.throws(function () { unitType.parseValue("3333.555 Oranges", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with ambiguous unit under showMeature=true in strict mode results in exception");
		// no value
		assert.throws(function () { unitType.parseValue("kg", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a string with only unit under showMeature=true in strict mode results in exception");
		// no value and no valid unit
		assert.throws(function () { unitType.parseValue("foo", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse a random string under showMeature=true in strict mode results in exception");

		// empty string is NaN by default
		assert.throws(function () { unitType.parseValue("", "string"); }, new ParseException(oBundle.getText("EnterNumber")), "parse empty string under showMeature=true in strict mode results in exception");

		// empty string is set to ""
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: false,
			customUnits: mCustomUnits,
			emptyString: ""
		});
		assert.deepEqual(unitType.parseValue("", "string"), ["", undefined], "emptyString option set to '' does not cause ParseException");

		// empty string is set to 0
		unitType = new UnitType({
			strictParsing: true,
			showMeasure: false,
			customUnits: mCustomUnits,
			emptyString: 0
		});
		assert.deepEqual(unitType.parseValue("", "string"), [0, undefined], "emptyString option set to 0 does not cause ParseException");
	});

	//*********************************************************************************************
[{
	oFormatOptions : {},
	sResult : "Unit.Invalid"
}, {
	oFormatOptions : {showMeasure : false},
	sResult : "EnterNumber"
}, {
	oFormatOptions : {showNumber : false},
	sResult : "Unit.InvalidMeasure"
}].forEach(function (oFixture, i) {
	QUnit.test("Unit: getParseException #" + i, function (assert) {
		var oResult,
			oType = new UnitType(oFixture.oFormatOptions);

		TestUtils.withNormalizedMessages(function () {
			// code under test
			oResult = oType.getParseException();
		});

		assert.ok(oResult instanceof ParseException);
		assert.strictEqual(oResult.message, oFixture.sResult);
	});
});

	//*********************************************************************************************
	QUnit.test("Unit: getPartsListeningToTypeChanges", function (assert) {
		const oUnitType = {bShowNumber: true};

		// code under test
		assert.deepEqual(UnitType.prototype.getPartsListeningToTypeChanges.call(oUnitType), [0]);

		oUnitType.bShowNumber = false;

		// code under test
		assert.deepEqual(UnitType.prototype.getPartsListeningToTypeChanges.call(oUnitType), []);
	});

	//*********************************************************************************************
[
	// no scale, formatOptions from this.oFormatOptions and aArgs passed to _getInstance
	{scale: undefined, options: {foo: "byThis"}, args: {bar: "byArgs"}, expected: {foo: "byThis", bar: "byArgs"}},
	// no scale, same formatOptions in favor of aArgs
	{scale: -1, options: {foo: "byThis"}, args: {foo: "byArgs"}, expected: {foo: "byArgs"}},
	// scale egdge case -1
	{scale: -1, options: {}, args: {}, expected: {}},
	// scale egdge case 0
	{scale: 0, options: {}, args: {}, expected: {maxFractionDigits: 0}},
	// scale -> maxFractionDigits
	{scale: 42, options: {}, args: {}, expected: {maxFractionDigits: 42}},
	// this.oFormatOptions.maxFractionDigits not overwritten by scale
	{scale: 42, options: {maxFractionDigits: 21}, args: {}, expected: {maxFractionDigits: 21}},
	// aArgs.maxFractionDigits neither overwritten by this.scale, nor by this.oFormatOptions
	{scale: 42, options: {maxFractionDigits: 21}, args: {maxFractionDigits: 22}, expected: {maxFractionDigits: 22}}
].forEach(({scale: iScale, options: oOptions, args: oArgs, expected : oExpectedOptions}, i) => {
	QUnit.test("Unit: _getInstance: consider scale, i=" + i, function (assert) {
		const oMetadata = {getClass() {}};
		const oUnitType = {
			oFormatOptions : oOptions,
			iScale : iScale,
			createFormatOptions() {},
			getMetadata : () => oMetadata
		};

		this.mock(oUnitType).expects("createFormatOptions").withExactArgs("~aArgs").returns(oArgs);
		this.mock(oMetadata).expects("getClass")
			.withExactArgs()
			.returns(i % 2 ? UnitType : "~NotUnitType"); // alternate between UnitType and other class
		this.mock(NumberFormat).expects("getUnitInstance").withExactArgs(oExpectedOptions).returns("~UnitInstance");

		// code under test
		assert.strictEqual(UnitType.prototype._getInstance.call(oUnitType, "~aArgs"), "~UnitInstance");
	});
});


	//*********************************************************************************************
[
	{aTypes : []},
	{aTypes : [{}], iScale : 0},
	{aTypes : [{oConstraints : {}}], iScale : 0},
	{aTypes : [{oConstraints : {scale : 24}}], iScale : 24},
	{aTypes : [{oConstraints : {scale : 24}}, {oConstraints : {scale : 42}}], iScale : 24}
].forEach(({aTypes, iScale}, i) => {
	QUnit.test("Unit: processPartTypes, i=" + i, function (assert) {
		const oUnitType = {};
		if (aTypes[0]) {
			aTypes[0].isA = () => {};
			this.mock(aTypes[0]).expects("isA").withExactArgs("sap.ui.model.odata.type.Decimal").returns(true);
		}

		// code under test
		UnitType.prototype.processPartTypes.call(oUnitType, aTypes);

		assert.strictEqual(oUnitType.iScale, iScale);
	});
});

	//*********************************************************************************************
	QUnit.test("Unit: processPartTypes, first part has non-Decimal type", function (assert) {
		const oUnitType = {iScale : 42};
		const oNonDecimalType = {isA() {}};
		this.mock(oNonDecimalType).expects("isA").withExactArgs("sap.ui.model.odata.type.Decimal").returns(false);

		// code under test
		UnitType.prototype.processPartTypes.call(oUnitType, [oNonDecimalType]);

		assert.strictEqual(oUnitType.iScale, 42);
	});
});