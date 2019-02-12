/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/type/Currency"
], function (Log, Currency, BaseCurrency) {
	/*global QUnit, sinon */
	"use strict";

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
		oType = new Currency(oFormatOptions);

		assert.ok(oType instanceof Currency, "is a Currency");
		assert.ok(oType instanceof BaseCurrency, "is a sap.ui.model.type.Currency");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Currency", "type name");
		assert.deepEqual(oType.oConstraints, {});
		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions);
		assert.deepEqual(oType.oFormatOptions, {groupingEnabled : false, parseAsString : true});
		assert.strictEqual(oType.getInterface(), oType, "returns no interface facade");
		assert.ok(oType.hasOwnProperty("mCustomCurrencies"));
		assert.strictEqual(oType.mCustomCurrencys, undefined);

		oFormatOptions.parseAsString = false;

		// code under test
		oType = new Currency(oFormatOptions);

		assert.strictEqual(oType.oFormatOptions.parseAsString, false);
		assert.deepEqual(oType.oFormatOptions, oFormatOptions);
		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions,
			"format options are immutable: clone");

		oFormatOptions.parseAsString = undefined;

		// code under test
		oType = new Currency(oFormatOptions);

		assert.strictEqual(oType.oFormatOptions.parseAsString, undefined);
		assert.deepEqual(oType.oFormatOptions, oFormatOptions);
		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions);

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
		[42, null, {}],
		[null, "EUR", {}],
		[undefined, undefined, {}],
		[null, undefined, {}],
		[undefined, null, {}],
		[null, null, {}]
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
		oBaseCurrencyMock.expects("setFormatOptions").never();

		// code under test: change to aValues[2] does not change existing customizing null
		assert.strictEqual(oType.formatValue(aValues, "foo"), "77 USD");

		assert.strictEqual(oType.mCustomCurrencies, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [78, "USD", undefined];
		oExpectation = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs([78, "USD"], "foo")
			.returns("78 USD");
		oBaseCurrencyMock.expects("setFormatOptions").never();

		// code under test: change to aValues[2] does not change existing customizing null
		assert.strictEqual(oType.formatValue(aValues, "foo"), "78 USD");

		assert.strictEqual(oType.mCustomCurrencies, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
	});

	//*********************************************************************************************
	QUnit.test("formatValue with customizing", function (assert) {
		var oBaseCurrencyMock = this.mock(BaseCurrency.prototype),
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
			oBaseFormatValueCall,
			oType = new Currency(),
			oType2 = new Currency(),
			oTypeCustomCurrencies;

		oSetFormatOptionsCall = oBaseCurrencyMock.expects("setFormatOptions").on(oType)
			.withExactArgs({customCurrencies : mCustomCurrencies, parseAsString : true});
		oBaseFormatValueCall = oBaseCurrencyMock.expects("formatValue").on(oType)
			.withExactArgs(["42", "EUR"], "foo")
			.returns("EUR 42.00");

		// code under test
		assert.strictEqual(oType.formatValue(["42", "EUR", mCustomizing], "foo"), "EUR 42.00");

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

		oBaseCurrencyMock.expects("setFormatOptions").on(oType2)
			.withExactArgs({
				customCurrencies : sinon.match.same(oType.mCustomCurrencies),
				parseAsString : true
			});
		oBaseCurrencyMock.expects("formatValue").on(oType2)
			.withExactArgs(["79", "EUR"], "foo")
			.returns("79.00 EUR");

		// code under test: new type instance reuses customizing
		assert.strictEqual(oType2.formatValue(["79", "EUR", mCustomizing], "foo"), "79.00 EUR");

		assert.deepEqual(oType2.mCustomCurrencies, mCustomCurrencies);
		assert.strictEqual(oType2.mCustomCurrencies, oTypeCustomCurrencies);
	});

	//*********************************************************************************************
	[false, true, undefined].forEach(function (bParseAsString) {
		QUnit.test("parseValue, parseAsString=" + bParseAsString, function (assert) {
			var mCustomizing = {
				"BHD" : {StandardCode : "BHD", UnitSpecificScale : 3},
				"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
				},
				oType = new Currency(bParseAsString !== undefined
					? {parseAsString : bParseAsString} : undefined);

			// make customizing available on type instance so that it can be used in parseValue
			assert.strictEqual(oType.formatValue([42, "EUR", mCustomizing], "string"),
				"EUR\u00a042.00");

			this.mock(BaseCurrency.prototype).expects("parseValue")
				.withExactArgs("42 EUR", "string")
				.on(oType)
				.callThrough();

			// code under test
			assert.deepEqual(oType.parseValue("42 EUR", "string"),
				[bParseAsString === false ? 42 : "42", "EUR"]);
		});
	});

	//*********************************************************************************************
	QUnit.test("parseValue, error if customizing is unset", function (assert) {
		assert.throws(function () {
			new Currency().parseValue("42 EUR", "string");
		}, new Error("Cannot parse value without currency customizing"));
	});

	//*********************************************************************************************
	QUnit.test("validateValue", function (assert) {
		var oType = new Currency();

		assert.throws(function () {
			// code under test
			oType.validateValue(["77", "EUR"]);
		}, new Error("Cannot validate value without currency customizing"));

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