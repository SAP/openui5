/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/type/Currency",
	"sap/ui/test/TestUtils"
], function (Log, ParseException, ValidateException, Currency, BaseCurrency, TestUtils) {
	/*global QUnit, sinon */
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Currency", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oFormatOptions = {groupingEnabled : false},
			oType;

		// code under test
		oType = new Currency();

		assert.ok(oType instanceof Currency, "is a Currency");
		assert.ok(oType instanceof BaseCurrency, "is a sap.ui.model.type.Currency");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Currency", "type name");
		assert.deepEqual(oType.oConstraints, {});
		assert.strictEqual(oType.bParseWithValues, true);
		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions,
			"format options are immutable: clone");
		assert.strictEqual(oType.getInterface(), oType, "returns no interface facade");
		assert.ok(oType.hasOwnProperty("mCustomCurrencies"));
		assert.strictEqual(oType.mCustomCurrencies, undefined);
		assert.deepEqual(oType.oFormatOptions, {parseAsString : true});

		// code under test
		oType = new Currency(oFormatOptions);

		assert.deepEqual(oType.oFormatOptions, {groupingEnabled : false, parseAsString : true});

		[false, undefined, ""].forEach(function (bParseAsString) {
			oFormatOptions.parseAsString = bParseAsString;

			// code under test
			oType = new Currency(oFormatOptions);

			assert.deepEqual(oType.oFormatOptions, {groupingEnabled : false, parseAsString : true});
			assert.notStrictEqual(oType.oFormatOptions, oFormatOptions,
				"format options are immutable: clone");
		});

		assert.throws(function () {
			oType = new Currency({}, {"minimum" : 42});
		}, new Error("Constraints not supported"));

		assert.throws(function () {
			oType = new Currency({}, undefined, []);
		}, new Error("Only the parameter oFormatOptions is supported"));

		assert.throws(function () {
			oType = new Currency({customCurrencies : {}});
		}, new Error("Format option customCurrencies is not supported"));
	});

	//*********************************************************************************************
	[
		// see CompositeType#formatValue: "If aValues is not defined or null, null will be returned"
		undefined,
		null,
		// CompositeBinding#getExternalValue always calls #formatValue of its type with the current
		// value of the property bindings which are its parts => array has always length 3
		[undefined, undefined, undefined],
		[42, undefined, undefined],
		[42, "EUR", undefined],
		[42, undefined, {}],
		[undefined, "EUR", {}],
		[undefined, undefined, {}],
		[null, undefined, {}],
		[undefined, null, {}]
	].forEach(function (aValues, i) {
		QUnit.test("formatValue returns null, " + i, function (assert) {
			var oType = new Currency();

			this.mock(BaseCurrency.prototype).expects("formatValue").never();

			assert.strictEqual(oType.formatValue(aValues, "foo"), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatValue w/o customizing", function (assert) {
		var oBaseCurrencyMock = this.mock(BaseCurrency.prototype),
			oExpectation,
			oType = new Currency(),
			aValues = [42, "EUR", null];

		oExpectation = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs([42, "EUR"], "foo")
			.returns("42 EUR");
		oBaseCurrencyMock.expects("setFormatOptions").never();

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "foo"), "42 EUR");

		assert.strictEqual(oType.mCustomCurrencies, null);
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [77, "USD", {/*customizing, not null*/}];
		oExpectation = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs([77, "USD"], "foo")
			.returns("77 USD");

		// code under test: change to aValues[2] does not change existing customizing null
		assert.strictEqual(oType.formatValue(aValues, "foo"), "77 USD");

		assert.strictEqual(oType.mCustomCurrencies, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [78, "USD", undefined];
		oExpectation = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs([78, "USD"], "foo")
			.returns("78 USD");

		// code under test: change to aValues[2] does not change existing customizing null
		assert.strictEqual(oType.formatValue(aValues, "foo"), "78 USD");

		assert.strictEqual(oType.mCustomCurrencies, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [42, null, undefined];
		oExpectation = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs([42, null], "foo")
			.returns("42");

		// code under test: delegate to base class formatValue if currency is initial (null)
		assert.strictEqual(oType.formatValue(aValues, "foo"), "42");

		assert.strictEqual(oType.mCustomCurrencies, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [null, "EUR", undefined];
		oExpectation = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs([null, "EUR"], "foo")
			.returns("EUR");

		// code under test: delegate to base class formatValue if amount is initial (null)
		assert.strictEqual(oType.formatValue(aValues, "foo"), "EUR");

		assert.strictEqual(oType.mCustomCurrencies, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
	});

	//*********************************************************************************************
	QUnit.test("formatValue with customizing", function (assert) {
		var oBaseFormatValueCall,
			oBaseCurrencyMock = this.mock(BaseCurrency.prototype),
			mCustomizing = {
				"BHD" : {StandardCode : "BHD", UnitSpecificScale : 3},
				"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
			},
			mCustomizing2,
			mCustomCurrencies = {
				"BHD" : {isoCode : "BHD", decimals : 3},
				"EUR" : {isoCode : "EUR", decimals : 2}
			},
			oSetFormatOptionsCall,
			oType = new Currency(),
			oType2 = new Currency(),
			oType3 = new Currency(),
			oTypeCustomCurrencies,
			aValues = ["42", "EUR", mCustomizing];

		oSetFormatOptionsCall = oBaseCurrencyMock.expects("setFormatOptions").on(oType)
			.withExactArgs({customCurrencies : mCustomCurrencies, parseAsString : true});
		oBaseFormatValueCall = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs(["42", "EUR"], "foo")
			.returns("EUR 42.00");

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "foo"), "EUR 42.00");

		assert.deepEqual(aValues, ["42", "EUR", mCustomizing], "aValues unmodified");
		assert.deepEqual(oType.mCustomCurrencies, mCustomCurrencies);
		assert.ok(oSetFormatOptionsCall.calledBefore(oBaseFormatValueCall),
			"setFormatOptions only called on first call to formatValue");

		oTypeCustomCurrencies = oType.mCustomCurrencies;
		oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs(["77", "EUR"], "foo")
			.returns("77 EUR");

		// code under test: 2nd call to formatValue reuses mCustomCurrencies from 1st call
		assert.strictEqual(oType.formatValue(["77", "EUR", mCustomizing], "foo"), "77 EUR");

		assert.deepEqual(oType.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType.mCustomCurrencies, oTypeCustomCurrencies);

		oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs(["77.1", "EUR"], "foo")
			.returns("77.10 EUR");

		// code under test: "MDC input scenario": call formatValue with the result of parseValue
		// as "aValues" which leaves the customizing part undefined -> use existing customizing
		assert.strictEqual(oType.formatValue(["77.1", "EUR"], "foo"), "77.10 EUR");

		assert.deepEqual(oType.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType.mCustomCurrencies, oTypeCustomCurrencies);

		mCustomizing2 = {"EUR" : {isoCode : "EUR", UnitSpecificScale : 1}};
		oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs(["77.1", "EUR"], "foo")
			.returns("77.10 EUR");

		// code under test: changed customizing reference is ignored
		assert.strictEqual(oType.formatValue(["77.1", "EUR", mCustomizing2], "foo"), "77.10 EUR");

		assert.deepEqual(oType.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType.mCustomCurrencies, oTypeCustomCurrencies);

		oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs(["78", "EUR"], "foo")
			.returns("78.00 EUR");

		// code under test: change customizing to null is ignored
		assert.strictEqual(oType.formatValue(["78", "EUR", null], "foo"), "78.00 EUR");

		assert.deepEqual(oType.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType.mCustomCurrencies, oTypeCustomCurrencies);

		oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs(["78", null], "foo")
			.returns("78");

		// code under test: delegate to base class formatValue if currency is initial (null)
		assert.strictEqual(oType.formatValue(["78", null, null], "foo"), "78");

		assert.deepEqual(oType.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType.mCustomCurrencies, oTypeCustomCurrencies);

		oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs([null, "KG"], "foo")
			.returns("KG");

		// code under test: delegate to base class formatValue if amount is initial (null)
		assert.strictEqual(oType.formatValue([null, "KG", null], "foo"), "KG");

		assert.deepEqual(oType.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType.mCustomCurrencies, oTypeCustomCurrencies);

		oBaseCurrencyMock.expects("setFormatOptions").on(oType2)
			.withExactArgs({
				customCurrencies : sinon.match.same(oType.mCustomCurrencies),
				parseAsString : true
			});
		oBaseCurrencyMock.expects("formatValue").on(oType2)
			.withExactArgs([null, null], "foo")
			.returns(null);

		// code under test: new type instance reuses customizing, even w/o amount and currency
		assert.strictEqual(oType2.formatValue([null, null, mCustomizing], "foo"), null);

		assert.deepEqual(oType2.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType2.mCustomCurrencies, oTypeCustomCurrencies);

		oBaseCurrencyMock.expects("setFormatOptions").on(oType3)
			.withExactArgs({
				customCurrencies : sinon.match.same(oType.mCustomCurrencies),
				parseAsString : true
			});
		oBaseCurrencyMock.expects("formatValue").on(oType3)
			.withExactArgs([null, "EUR"], "foo")
			.returns("EUR");

		// code under test: new type instance reuses customizing, even w/o amount
		assert.strictEqual(oType3.formatValue([null, "EUR", mCustomizing], "foo"), "EUR");

		assert.deepEqual(oType3.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType3.mCustomCurrencies, oTypeCustomCurrencies);
	});

	//*********************************************************************************************
	[
		undefined,
		{parseAsString : false},
		{parseAsString : true},
		{parseAsString : undefined},
		{parseAsString : ""}
	].forEach(function (oFormatOptions) {
		var sTitle = "parseValue, format options=" + JSON.stringify(oFormatOptions);

		QUnit.test(sTitle, function (assert) {
			var oBaseCurrencyMock = this.mock(BaseCurrency.prototype),
				aCurrentValues = [{/*unused*/}, "EUR", {/*unused*/}],
				mCustomizing = {
					"BHD" : {StandardCode : "BHD", UnitSpecificScale : 3},
					"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
				},
				oType = new Currency(oFormatOptions);

			// make customizing available on type instance so that it can be used in parseValue
			assert.strictEqual(oType.formatValue([42, "EUR", mCustomizing], "string"),
				"EUR\u00a042.00");

			oBaseCurrencyMock.expects("parseValue")
				.withExactArgs("42 EUR", "string", sinon.match.same(aCurrentValues))
				.on(oType)
				.callThrough();

			// code under test
			assert.deepEqual(oType.parseValue("42 EUR", "string", aCurrentValues),
				[!oFormatOptions || oFormatOptions.parseAsString ? "42" : 42, "EUR"]);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bParseAsString) {
		var sTitle = "parseValue: remove trailing zeroes, parseAsString=" + bParseAsString;

		QUnit.test(sTitle, function (assert) {
			var oBaseCurrencyMock = this.mock(BaseCurrency.prototype),
				aCurrentValues = [{/*unused*/}, null, {/*unused*/}],
				mCustomizing = {
					"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
				},
				oType = new Currency({parseAsString : bParseAsString});

			// make customizing available on type instance so that it can be used in parseValue
			assert.strictEqual(oType.formatValue([42, "EUR", mCustomizing], "string"),
				"EUR\u00a042.00");

			oBaseCurrencyMock.expects("parseValue")
				.withExactArgs("12.100", "string", sinon.match.same(aCurrentValues))
				.on(oType)
				.callThrough();

			// code under test: remove trailing zeroes before decimals check, part 1
			assert.deepEqual(oType.parseValue("12.100", "string", aCurrentValues),
				[bParseAsString ? "12.1" : 12.1, undefined]);

			oBaseCurrencyMock.expects("parseValue")
				.withExactArgs("12.000", "string", sinon.match.same(aCurrentValues))
				.on(oType)
				.callThrough();

			// code under test: remove trailing zeroes before decimals check, part 2
			assert.deepEqual(oType.parseValue("12.000", "string", aCurrentValues),
				[bParseAsString ? "12" : 12, undefined]);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bParseAsString) {
		var sTitle = "parseValue: check decimals, parseAsString=" + bParseAsString;

		QUnit.test(sTitle, function (assert) {
			var oBaseCurrencyMock = this.mock(BaseCurrency.prototype),
				aCurrentValues = [{/*unused*/}, "EUR", {/*unused*/}],
				mCustomizing = {
					"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2},
					"JPY" : {StandardCode : "JPY", UnitSpecificScale : 0}
				},
				oType = new Currency({parseAsString : bParseAsString});

			// make customizing available on type instance so that it can be used in parseValue
			assert.strictEqual(oType.formatValue([42, "EUR", mCustomizing], "string"),
				"EUR\u00a042.00");

			oBaseCurrencyMock.expects("parseValue")
				.withExactArgs("12.12 EUR", "string", sinon.match.same(aCurrentValues))
				.on(oType)
				.callThrough();

			// code under test: amount with currency
			assert.deepEqual(oType.parseValue("12.12 EUR", "string", aCurrentValues),
				[bParseAsString ? "12.12" : 12.12, "EUR"]);

			oBaseCurrencyMock.expects("parseValue")
				.withExactArgs("12.12", "string", sinon.match.same(aCurrentValues))
				.on(oType)
				.callThrough();

			// code under test: amount w/o currency
			assert.deepEqual(oType.parseValue("12.12", "string", aCurrentValues),
				[bParseAsString ? "12.12" : 12.12, undefined]);
		});
	});

	//*********************************************************************************************
	QUnit.test("parseValue: check decimals, error cases", function (assert) {
		var oBaseCurrencyMock = this.mock(BaseCurrency.prototype),
			aCurrentValues = [{/*unused*/}, "EUR", {/*unused*/}],
			mCustomizing = {
				"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2},
				"JPY" : {StandardCode : "JPY", UnitSpecificScale : 0}
			},
			oType = new Currency();

		// make customizing available on type instance so that it can be used in parseValue
		assert.strictEqual(oType.formatValue([42, "EUR", mCustomizing], "string"),
			"EUR\u00a042.00");

		oBaseCurrencyMock.expects("parseValue")
			.withExactArgs("123456789012345678901234567890.123 EUR", "string",
				sinon.match.same(aCurrentValues))
			.on(oType)
			.callThrough();

		// code under test: parse exception with number of decimals
		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				oType.parseValue("123456789012345678901234567890.123 EUR", "string",
					aCurrentValues);
			}, new ParseException("EnterNumberFraction 2"));
		});

		aCurrentValues[1] = "JPY";
		oBaseCurrencyMock.expects("parseValue")
			.withExactArgs("12.1", "string", sinon.match.same(aCurrentValues))
			.on(oType)
			.callThrough();

		// code under test: parse exception w/o decimals
		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				oType.parseValue("12.1", "string", aCurrentValues);
			}, new ParseException("EnterInt"));
		});
	});

	//*********************************************************************************************
	QUnit.test("parseValue: empty field", function (assert) {
		var aCurrentValues = [null, null, {/*unused*/}],
			mCustomizing = {
				"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
			},
			oType = new Currency();

		// make customizing available on type instance so that it can be used in parseValue
		// there is no "previous unit" -> null
		assert.strictEqual(oType.formatValue([null, null, mCustomizing], "string"), null);

		this.mock(BaseCurrency.prototype).expects("parseValue")
			.withExactArgs("42", "string", sinon.match.same(aCurrentValues))
			.on(oType)
			.callThrough();

		// code under test
		assert.deepEqual(oType.parseValue("42", "string", aCurrentValues), ["42", undefined]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: no customizing", function (assert) {
		var oType = new Currency();

		assert.strictEqual(oType.formatValue([null, null, null], "string"), null);

		// code under test
		assert.deepEqual(oType.parseValue("42.123 EUR", "string"), ["42.123", "EUR"]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue, error if customizing is unset", function (assert) {
		assert.throws(function () {
			new Currency().parseValue("42 EUR", "string");
		}, new ParseException("Cannot parse value without currency customizing"));
	});

	//*********************************************************************************************
	QUnit.test("validateValue", function (assert) {
		var oType = new Currency();

		assert.throws(function () {
			// code under test
			oType.validateValue(["77", "EUR"]);
		}, new ValidateException("Cannot validate value without currency customizing"));

		oType.formatValue(["42", "EUR", {"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}}],
			"string");

		// code under test
		oType.validateValue(["77", "EUR"]);

		oType = new Currency();
		oType.formatValue(["42", "EUR", null], "string");

		// code under test
		oType.validateValue(["77", "EUR"]);
	});

	//*********************************************************************************************
	QUnit.test("setConstraints not supported", function (assert) {
		assert.throws(function () {
			// code under test
			new Currency().setConstraints({"Minimum" : 42});
		}, new Error("Constraints not supported"));
	});

	//*********************************************************************************************
	QUnit.test("setFormatOptions not supported", function (assert) {
		assert.throws(function () {
			// code under test
			new Currency().setFormatOptions({"parseAsString" : false});
		}, new Error("Format options are immutable"));
	});
});