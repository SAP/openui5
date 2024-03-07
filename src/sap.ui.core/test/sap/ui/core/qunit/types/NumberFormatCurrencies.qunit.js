/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/format/FormatUtils",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/base/Log"
], function(Formatting, Localization, FormatUtils, NumberFormat, Locale, LocaleData, Log) {
	"use strict";

	var getCurrencyInstance = function(options, oLocale) {
		if (!options) {
			options = {};
		}
		if (!options.hasOwnProperty("trailingCurrencyCode")) {
			options.trailingCurrencyCode = false;
		}
		return NumberFormat.getCurrencyInstance(options, oLocale);
	};

	/*
		\xa0 is "NO-BREAK SPACE"
		\ufeff is "ZERO WIDTH NO-BREAK SPACE"

		CLDR uses different whitespace characters in its patterns
	*/

	QUnit.module("NumberFormat#getCurrencyInstance");

	QUnit.test("Currency format default formatting", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getCurrencyInstance({}, oLocale);

		assert.strictEqual(oFormat.format(0.123, "EUR"), "0.12\xa0EUR", "0.123");
		assert.strictEqual(oFormat.format(123, "EUR"), "123.00\xa0EUR", "123");
		assert.strictEqual(oFormat.format(123.23, "EUR"), "123.23\xa0EUR", "123.23");
		assert.strictEqual(oFormat.format(1234, "EUR"), "1,234.00\xa0EUR", "1234");
		assert.strictEqual(oFormat.format(12345, "EUR"), "12,345.00\xa0EUR", "12345");
		assert.strictEqual(oFormat.format(12345.123, "EUR"), "12,345.12\xa0EUR", "12345.123");
		assert.strictEqual(oFormat.format(12345.12345, "EUR"), "12,345.12\xa0EUR", "12345.12345");
		assert.strictEqual(oFormat.format(1234567890, "EUR"), "1,234,567,890.00\xa0EUR", "1234567890");
		assert.strictEqual(oFormat.format(-123.23, "EUR"), "-123.23\xa0EUR", "-123.23");
		assert.strictEqual(oFormat.format(1.23e+9, "EUR"), "1,230,000,000.00\xa0EUR", "1.23e+9");
		assert.strictEqual(oFormat.format(1.23e-9, "EUR"), "0.00\xa0EUR", "1.23e-9");
		assert.strictEqual(oFormat.format(-1.23e+9, "EUR"), "-1,230,000,000.00\xa0EUR", "-1.23e+9");
		assert.strictEqual(oFormat.format(-1.23e-9, "EUR"), "0.00\xa0EUR", "-1.23e-9");
		assert.strictEqual(oFormat.format("1.23e+9", "EUR"), "1,230,000,000.00\xa0EUR", "1.23e+9");
		assert.strictEqual(oFormat.format("1.23e-9", "EUR"), "0.00\xa0EUR", "1.23e-9");
		assert.strictEqual(oFormat.format("-1.23e+9", "EUR"), "-1,230,000,000.00\xa0EUR", "-1.23e+9");
		assert.strictEqual(oFormat.format("-1.23e-9", "EUR"), "0.00\xa0EUR", "-1.23e-9");
		assert.strictEqual(oFormat.format("1.2345e+2", "EUR"), "123.45\xa0EUR", "1.2345e+2");
		assert.strictEqual(oFormat.format("12345e-2", "EUR"), "123.45\xa0EUR", "12345e-2");
		assert.strictEqual(oFormat.format("-1.2345e+2", "EUR"), "-123.45\xa0EUR", "-1.2345e+2");
		assert.strictEqual(oFormat.format("-12345e-2", "EUR"), "-123.45\xa0EUR", "-12345e-2");
		assert.strictEqual(oFormat.format("123.45e+2", "EUR"), "12,345.00\xa0EUR", "123.45e+2");
		assert.strictEqual(oFormat.format("12.345e-2", "EUR"), "0.12\xa0EUR", "12.345e-2");
		assert.strictEqual(oFormat.format("-123.45e+2", "EUR"), "-12,345.00\xa0EUR", "-123.45e+2");
		assert.strictEqual(oFormat.format("-12.345e-2", "EUR"), "-0.12\xa0EUR", "-12.345e-2");
		assert.strictEqual(oFormat.format("123456.789e+2", "EUR"), "12,345,678.90\xa0EUR", "123456.789e+2");
		assert.strictEqual(oFormat.format("123.456789e-2", "EUR"), "1.23\xa0EUR", "123.456789e-2");
		assert.strictEqual(oFormat.format("-123456.789e+2", "EUR"), "-12,345,678.90\xa0EUR", "-123456.789e+2");
		assert.strictEqual(oFormat.format("-123.456789e-2", "EUR"), "-1.23\xa0EUR", "-123.456789e-2");
		assert.strictEqual(oFormat.format("1000.00", "EUR"), "1,000.00\xa0EUR", "1000.00");
		assert.strictEqual(oFormat.format("1000.0000", "EUR"), "1,000.00\xa0EUR", "1000.0000");
		assert.strictEqual(oFormat.format(123456789.12345679, "EUR"), "123,456,789.12\xa0EUR", "123456789.123456789 (number)");
		assert.strictEqual(oFormat.format("123456789.123456789", "EUR"), "123,456,789.12\xa0EUR", "123456789.123456789 (string)");
	});

	QUnit.test("Currency format default formatting preserveDecimals=true", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getCurrencyInstance({preserveDecimals:true}, oLocale);

		assert.strictEqual(oFormat.format(0.123, "EUR"), "0.123\xa0EUR", "0.123");
		assert.strictEqual(oFormat.format(123, "EUR"), "123.00\xa0EUR", "123");
		assert.strictEqual(oFormat.format(123.23, "EUR"), "123.23\xa0EUR", "123.23");
		assert.strictEqual(oFormat.format(1234, "EUR"), "1,234.00\xa0EUR", "1234");
		assert.strictEqual(oFormat.format(12345, "EUR"), "12,345.00\xa0EUR", "12345");
		assert.strictEqual(oFormat.format(12345.123, "EUR"), "12,345.123\xa0EUR", "12345.123");
		assert.strictEqual(oFormat.format(12345.12345, "EUR"), "12,345.12345\xa0EUR", "12345.12345");
		assert.strictEqual(oFormat.format(1234567890, "EUR"), "1,234,567,890.00\xa0EUR", "1234567890");
		assert.strictEqual(oFormat.format(-123.23, "EUR"), "-123.23\xa0EUR", "-123.23");
		assert.strictEqual(oFormat.format("1.23e+9", "EUR"), "1,230,000,000.00\xa0EUR", "1.23e+9");
		assert.strictEqual(oFormat.format("1.23e-9", "EUR"), "0.00000000123\xa0EUR", "1.23e-9");
		assert.strictEqual(oFormat.format("-1.23e+9", "EUR"), "-1,230,000,000.00\xa0EUR", "-1.23e+9");
		assert.strictEqual(oFormat.format("-1.23e-9", "EUR"), "-0.00000000123\xa0EUR", "-1.23e-9");
		assert.strictEqual(oFormat.format("1.2345e+2", "EUR"), "123.45\xa0EUR", "1.2345e+2");
		assert.strictEqual(oFormat.format("12345e-2", "EUR"), "123.45\xa0EUR", "12345e-2");
		assert.strictEqual(oFormat.format("-1.2345e+2", "EUR"), "-123.45\xa0EUR", "-1.2345e+2");
		assert.strictEqual(oFormat.format("-12345e-2", "EUR"), "-123.45\xa0EUR", "-12345e-2");
		assert.strictEqual(oFormat.format("123.45e+2", "EUR"), "12,345.00\xa0EUR", "123.45e+2");
		assert.strictEqual(oFormat.format("12.345e-2", "EUR"), "0.12345\xa0EUR", "12.345e-2");
		assert.strictEqual(oFormat.format("-123.45e+2", "EUR"), "-12,345.00\xa0EUR", "-123.45e+2");
		assert.strictEqual(oFormat.format("-12.345e-2", "EUR"), "-0.12345\xa0EUR", "-12.345e-2");
		assert.strictEqual(oFormat.format("123456.789e+2", "EUR"), "12,345,678.90\xa0EUR", "123456.789e+2");
		assert.strictEqual(oFormat.format("123.456789e-2", "EUR"), "1.23456789\xa0EUR", "123.456789e-2");
		assert.strictEqual(oFormat.format("-123456.789e+2", "EUR"), "-12,345,678.90\xa0EUR", "-123456.789e+2");
		assert.strictEqual(oFormat.format("-123.456789e-2", "EUR"), "-1.23456789\xa0EUR", "-123.456789e-2");
		assert.strictEqual(oFormat.format("1.20300", "EUR"), "1.203\xa0EUR", "1.20300");
		assert.strictEqual(oFormat.format("1000.00", "EUR"), "1,000.00\xa0EUR", "1000.00");
		assert.strictEqual(oFormat.format("1000.0000", "EUR"), "1,000.00\xa0EUR", "1000.0000");
		assert.strictEqual(oFormat.format("1000.00000000", "EUR"), "1,000.00\xa0EUR", "1000.00000000");
		assert.strictEqual(oFormat.format(123456789.12345679, "EUR"), "123,456,789.12345679\xa0EUR", "123456789.123456789 (number)");
		assert.strictEqual(oFormat.format("123456789.123456789", "EUR"), "123,456,789.123456789\xa0EUR", "123456789.123456789 (string)");
	});

	QUnit.test("Currency format with sMeasure", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({}, oLocale);
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "JPY" + "\xa0" + "123,457", "123456.789 JPY");
		assert.strictEqual(oFormat.format([123456.789, "JPY"]), "JPY" + "\xa0" + "123,457", "123456.789 JPY");
		assert.strictEqual(oFormat.format(-123456.789, "JPY"), "JPY" + "\ufeff" + "-123,457", "-123456.789 JPY");
		assert.strictEqual(oFormat.format([-123456.789, "JPY"]), "JPY" + "\ufeff" + "-123,457", "-123456.789 JPY");
	});

	QUnit.test("Currency format with showNumber false and showMeasure false", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({showNumber: false, showMeasure: false}, oLocale);
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "", "nothing shown");
	});

	QUnit.test("Currency format with showNumber", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({showNumber: false}, oLocale);
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR", "only currency EUR is displayed");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "EUR", "only currency EUR is displayed");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "EUR", "only currency EUR is displayed");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "EUR", "only currency EUR is displayed");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "JPY", "only currency JPY is displayed");
		assert.strictEqual(oFormat.format([123456.789, "JPY"]), "JPY", "only currency JPY is displayed");
		assert.strictEqual(oFormat.format(-123456.789, "JPY"), "JPY", "only currency JPY is displayed");
		assert.strictEqual(oFormat.format([-123456.789, "JPY"]), "JPY", "only currency JPY is displayed");
	});

	QUnit.test("Currency parse with showNumber=false", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({showNumber: false}, oLocale);

		assert.deepEqual(oFormat.parse("EUR"), [undefined, "EUR"], "EUR");
		assert.deepEqual(oFormat.parse("XXX"), [undefined, "XXX"], "XXX");

		// null values
		assert.strictEqual(oFormat.parse(""), null, "");
		assert.strictEqual(oFormat.parse("x"), null, "x");
		assert.strictEqual(oFormat.parse("kg"), null, "kg");
		assert.strictEqual(oFormat.parse("1"), null, "1");
		assert.strictEqual(oFormat.parse("1.00"), null, "1.00");
		assert.strictEqual(oFormat.parse("1.00\x0aEUR"), null, "1.00 EUR");
		assert.strictEqual(oFormat.parse("1.23\x0aXXX"), null, "1.23 XXX");
		assert.strictEqual(oFormat.parse("1.23 kg"), null, "1.23 kg");
	});

	QUnit.test("Currency format with showNumber and currency symbols", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({showNumber: false, currencyCode: false}, oLocale);
		assert.strictEqual(oFormat.format(0, "EUR"), "\u20ac", "only currency symbol for EUR is displayed");
		assert.strictEqual(oFormat.format(0, "JPY"), "\u00a5", "only currency symbol for JPY is displayed");
		assert.strictEqual(oFormat.format(0, "INR"), "\u20b9", "only currency symbol for INR is displayed");
	});

	QUnit.test("Currency parse with showNumber and currency symbols", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({showNumber: false, currencyCode: false}, oLocale);
		assert.deepEqual(oFormat.parse("\u20ac"), [undefined, "EUR"], "only currency symbol for EUR is displayed");
		assert.deepEqual(oFormat.parse("\u00a5"), [undefined, "JPY"], "only currency symbol for JPY is displayed");
		assert.deepEqual(oFormat.parse("\u20b9"), [undefined, "INR"], "only currency symbol for INR is displayed");
		assert.deepEqual(oFormat.parse("A$"), [undefined, "AUD"], "only currency symbol for AUD is displayed");
		assert.deepEqual(oFormat.parse("$"), [undefined, "USD"], "only currency symbol for USD is displayed");
		assert.deepEqual(oFormat.parse("x"), null, "unknown unit");
	});

	QUnit.test("Currency parse with showNumber and currency codes", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({showNumber: false, currencyCode: false}, oLocale);
		assert.deepEqual(oFormat.parse("EUR"), [undefined, "EUR"], "only currency code for EUR is displayed");
		assert.deepEqual(oFormat.parse("JPY"), [undefined, "JPY"], "only currency code for JPY is displayed");
		assert.deepEqual(oFormat.parse("INR"), [undefined, "INR"], "only currency code for INR is displayed");
		assert.deepEqual(oFormat.parse("USD"), [undefined, "USD"], "only currency code for USD is displayed");
	});

	QUnit.test("Currency format with sMeasure and style", function (assert) {
		var oLocale = new Locale("en-US");
		var oFormat = getCurrencyInstance({style: "long"}, oLocale);
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123K", "123456.789 EUR");

		oFormat = getCurrencyInstance({style: "short"}, oLocale);
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" +  "123K", "123456.789 EUR");

		oFormat = getCurrencyInstance({style: "standard"}, oLocale);
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" +  "123,456.79", "123456.789 EUR");

		oFormat = getCurrencyInstance({style: "foo"}, oLocale);
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" +  "123,456.79", "123456.789 EUR");
	});

	QUnit.test("Currency format for locale DE", function (assert) {
		var oLocale = new Locale("de-DE");
		// currency only supports "short" style. Therefore, result should be the same for both styles.
		["long", "short"].forEach(function(sStyle) {
			var oFormat = getCurrencyInstance({ style: sStyle }, oLocale);
			// thousand format for locale "de" does not reformat the number (pattern: "100000-other": "0")
			assert.strictEqual(oFormat.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "EUR");
			assert.strictEqual(oFormat.format(-123456.789, "JPY"), "-123.457" + "\xa0" + "JPY");

			// million format for locale "de" does reformat the number (pattern: "1000000-other": "0 Mio'.' ¤")
			assert.strictEqual(oFormat.format(47123456.789, "EUR"), "47" + "\xa0" + "Mio." + "\xa0" + "EUR");
			assert.strictEqual(oFormat.format(-47123456.789, "JPY"), "-47" + "\xa0" + "Mio." + "\xa0" + "JPY");
		});
	});

	QUnit.test("Currency format for locale HE", function (assert) {
		var oLocale = new Locale("he_IL");
		var oFormat = getCurrencyInstance({ currencyCode: true }, oLocale);

		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "\u200f\u200e-123,456.79\u00a0\u200fEUR\u200e");
		assert.strictEqual(oFormat.format(-123456.789, "JPY"), "\u200f\u200e-123,457\u00a0\u200fJPY\u200e");
	});

	QUnit.test("Currency format with different parameters undefined", function (assert) {
		var oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F",
					decimals: 3
				}
			}
		});
		assert.strictEqual(oFormat.format(undefined, undefined), "", "no values returns an empty string");
		assert.strictEqual(oFormat.format(1234.56, undefined), "1,234.56", "only number formatted");
		assert.strictEqual(oFormat.format(1234.5728, "FOB"), "F" + "\xa0" + "1,234.573", "formatted both");
	});

	QUnit.test("Currency format with sMeasure - unknown currency", function (assert) {
		var oFormat = getCurrencyInstance();

		//invalid unit
		assert.strictEqual(oFormat.format(123456.789, undefined), "123,456.79", "123456.79");
		assert.strictEqual(oFormat.format([123456.789, undefined]), "123,456.79", "123456.79");
		assert.strictEqual(oFormat.format(-123456.789, undefined), "-123,456.79", "-123456.79");
		assert.strictEqual(oFormat.format([-123456.789, "ASDEF"]), "ASDEF\ufeff-123,456.79", "-123456.789 ASDEF");
		assert.strictEqual(oFormat.format([-123456.789, false]), "", "-123456.789 false");
		assert.strictEqual(oFormat.format([-123456.789, NaN]), "", "-123456.789 NaN");
		assert.strictEqual(oFormat.format([-123456.789, undefined]), "-123,456.79", "-123456.789 undefined");
		assert.strictEqual(oFormat.format([-123456.789, null]), "-123,456.79", "-123456.789 null");
	});

	QUnit.test("Currency Format with fraction as decimals", function (assert) {
		var oFormat = getCurrencyInstance({minFractionDigits:6, maxFractionDigits: 6});
		assert.strictEqual(oFormat.format(2, "EUR"), "EUR" + "\xa0" + "2.000000", "fractions should set the decimals if not specified");
	});

	//*********************************************************************************************
[// integrative tests for NumberFormat#getMaximalDecimals
	{iDecimals: 3, iMaxFractionDigits: 4, iValue: 1234.5678, sExpected: "1,234.568\xa0BTC"},
	{iDecimals: 3, iMaxFractionDigits: Infinity, iValue: 1234.5678, sExpected: "1,234.568\xa0BTC" },
	{iDecimals: 3, iMaxFractionDigits: 2, iValue: 1234.567, sExpected: "1,234.57\xa0BTC" },
	{iDecimals: undefined, iMaxFractionDigits: 1, iValue: 1234.56789, sExpected: "1,234.6\xa0BTC" },
	{iDecimals: 1, iMaxFractionDigits: undefined, iValue: 1234.567, sExpected: "1,234.6\xa0BTC" }
].forEach(({iDecimals, iMaxFractionDigits, iValue, sExpected}, i) => {
	QUnit.test("Currency formatOptions: take min of maxFractionDigits and decimals: " + i, function (assert) {
		const oFormatOptions = {customCurrencies: {BTC: {decimals: iDecimals}}, maxFractionDigits: iMaxFractionDigits};

		this.mock(NumberFormat).expects("getMaximalDecimals").withExactArgs(sinon.match(oFormatOptions)).callThrough();

		 // only for the iDecimals:undefined fixture: otherwise the default 2 by Locale.getCurrencyDigits wins
		oFormatOptions.minFractionDigits = iDecimals === undefined && "~notUndefined";

		// code under test
		assert.strictEqual(NumberFormat.getCurrencyInstance(oFormatOptions).format(iValue, "BTC"), sExpected);
	});
});

	QUnit.test("Currency format with sMeasure and showMeasure as symbol", function (assert) {
		var oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "€\ufeff" + "-123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "€\ufeff" + "-123,456.79", "123456.789 EUR");
	});


	QUnit.test("Currency format with custom number of decimals", function (assert) {
		var oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.strictEqual(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.strictEqual(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.79 BTC");

		// set custom currency digits
		Formatting.setCustomCurrencies({
			"EUR": { "digits": 1 },
			"JPY": { "digits": 3 },
			"CZK": { "digits": 3 },
			"BTC": { "digits": 5 }
		});

		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.8", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,456.789", "123456.789 YEN");
		assert.strictEqual(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.789", "123456.789 CZK");
		assert.strictEqual(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.78900", "123456.789 BTC");

		// add custom currencies
		Formatting.addCustomCurrencies({
			"DEFAULT": { "digits": 6 }
		});
		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.8", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "MON"), "MON\xa0" + "123,456.789000", "123456.789 MON");

		// reset custom currencies
		Formatting.setCustomCurrencies();

		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.strictEqual(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.strictEqual(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.789 BTC");
	});

	QUnit.test("Currency format with sMeasure and showMeasure set to none", function (assert) {
		var oFormat = getCurrencyInstance({
			showMeasure: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "-123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "-123,456.79", "123456.789 EUR");
	});

	//*********************************************************************************************
	QUnit.test("#format: use correct plural rule for compact currency representations", function (assert) {
		var oFormat = getCurrencyInstance({style: "short"}, new Locale("de")),
			oStub = this.stub(oFormat.oLocaleData, "_get");

		// return fake "currencyFormat-short" in CLDR data to make different plural rules testable
		oStub.withArgs("currencyFormat-short").returns({
			"1000000-one": "0 Million ¤",
			"1000000-other": "0 Millionen ¤"
		});
		// do not stub other LocaleData#_get calls
		oStub.callThrough();

		assert.strictEqual(oFormat.format("1000000", "EUR"), "1 Million EUR");
		assert.strictEqual(oFormat.format("1200000", "EUR"), "1,2 Millionen EUR");
	});

	QUnit.module("Custom currencies - Unknown currencies", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Format using currency instance", function (assert) {
		var oFormat = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		}), sFormatted = oFormat.format(123456.789, "EUR"); // Empty string "";

		assert.strictEqual(sFormatted, "", "Empty string formatted.");
		assert.deepEqual(oFormat.parse(""), [NaN, undefined], "[NaN, undefined] is returned.");
		assert.deepEqual(oFormat.parse(" \t\n\r\u00a0"), [NaN, undefined], "'space only' are trimmed");
		assert.deepEqual(oFormat.parse("123.456,789 BTC"), null, "null is returned.");
		// tolerated, despite wrong grouping, because of multiple grouping separators
		assert.deepEqual(oFormat.parse("12,3,456 BTC"), [123456, "BTC"], "null is returned.");
		// not tolerated, because single separator with wrong grouping base size (assumingly a decimal separator)
		assert.deepEqual(oFormat.parse("12,3456 BTC"), null, "null is returned.");
		// tolerated, as single separator with grouping base size (assumingly a grouping separator)
		assert.deepEqual(oFormat.parse("123.456 BTC"), [123.456, "BTC"], "[NaN, undefined] is returned.");

		// emptyString: ""
		var oFormat3 = getCurrencyInstance({
			emptyString: "",
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		}), sFormatted2 = oFormat.format(123456.789, "EUR"); // Empty string "";

		assert.strictEqual(sFormatted2, "", "Empty string formatted.");
		assert.deepEqual(oFormat3.parse(""), ["", undefined], "['', undefined] is returned.");
	});

	QUnit.module("Custom currencies - simple formatting", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Parse symbol only", function(assert) {
		var oFormat = getCurrencyInstance({
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"EURO": {
					decimals: 2,
					symbol: "€"
				},
				"Bitcoin": {
					decimals: 5,
					symbol: "Ƀ"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$"), null, "Null is returned.");
		assert.deepEqual(oFormat.parse("€"), null, "Null is returned.");
		assert.deepEqual(oFormat.parse("Ƀ"), null, "Null is returned.");
	});

	QUnit.test("Missing decimals information in defined custom currencies", function (assert) {
		var oFormat = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ"
				}
			}
		});

		var sFormatted = oFormat.format(123456.789, "BTC");

		assert.strictEqual(sFormatted, "BTC" + "\xa0" + "123,456.79", "Default decimals are 2");
	});

	QUnit.test("Custom Currencies defined via currency instance options", function (assert) {

		// Format $, to make sure there is no space between the symbol and the formatted number value
		var oFormat1 = getCurrencyInstance({
			currencyCode: false
		}), sFormatted1 = oFormat1.format(123456.789, "USD");

		assert.strictEqual(sFormatted1, "$123,456.79", "$123,456.79");

		// currencyCode: true
		var oFormat = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}), sFormatted = oFormat.format(123456.789, "BTC");

		assert.strictEqual(sFormatted, "BTC" + "\xa0" + "123,456.789", "BTC 123,456.789");
		assert.deepEqual(oFormat.parse(sFormatted), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		// currencyCode: false
		var oFormat2 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}), sFormatted2 = oFormat2.format(123456.789, "BTC");

		assert.strictEqual(sFormatted2, "Ƀ\xa0123,456.789", "Ƀ\xa0123,456.789");
		assert.deepEqual(oFormat.parse(sFormatted2), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		var oFormat3 = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}, new Locale("de-x-sapufmt")), sFormatted3 = oFormat3.format(123456.789, "BTC");

		assert.strictEqual(sFormatted3, "123.456,789" + "\xa0" + "BTC", "123.456,789 BTC");
		assert.deepEqual(oFormat3.parse(sFormatted3), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		var oFormat4 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}, new Locale("de-x-sapufmt")), sFormatted4 = oFormat4.format(123456.789, "BTC");

		assert.strictEqual(sFormatted4, "123.456,789" + "\xa0" + "Ƀ", "123.456,789 Ƀ");
		assert.deepEqual(oFormat4.parse(sFormatted4), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");
	});

	QUnit.test("'decimals' set on FormatOptions and custom currency", function (assert) {
		var oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€",
					decimals: 6
				}
			},
			decimals: 1
		});

		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,234.572800", "formatted with 6 decimals - en");

		var oFormatDE = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"HOD": {
					symbol: "H$",
					decimals: 4
				}
			},
			decimals: 1
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5728, "HOD"), "1.234,5728" + "\xa0" + "H$", "formatted with 4 decimals - de");
	});

	QUnit.test("'decimals' only set on format-options", function (assert) {
		// custom currency
		var oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€"
				}
			},
			decimals: 3
		});

		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,234.573", "formatted with default 2 decimals - en");

		// known currency
		var oFormatDE = getCurrencyInstance({
			currencyCode: false,
			decimals: 1
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5728, "HUF"), "1.234,6" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
	});

	QUnit.test("no 'decimals' set at all", function (assert) {
		var oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€"
				}
			}
		});

		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,234.57", "formatted with default 2 decimals - en");

		var oFormatDE = getCurrencyInstance({
			currencyCode: false
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5728, "HUF"), "1.235" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
	});

	QUnit.module("Custom currencies - currencyCode: false", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Format with currency symbol w/o symbol mixed in", function (assert) {
		var oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"Bitcoin": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}), sFormatted = oFormat.format(123456.789, "Bitcoin");

		assert.strictEqual(sFormatted, "Ƀ" + "\xa0" + "123,456.789", "'Ƀ\xa0123,456.789' is formatted");
		assert.deepEqual(oFormat.parse(sFormatted), [123456.789, 'Bitcoin'], "[123456.789, 'Bitcoin']");
	});

	QUnit.test("Format with currency symbol with isoCode lookup", function (assert) {
		Formatting.addCustomCurrencies({
			"BTC": {
				"symbol": "Ƀ",
				"decimals": 5
			}
		});

		var oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"Bitcoin": {
					"decimals": 3,
					"isoCode": "BTC"
				},
				"EURO": {
					"decimals": 2,
					"isoCode": "EUR"
				},
				"DOLLAR": {
					"decimals": 4
				}
			}
		});

		// symbol lookup in global configuration
		assert.strictEqual(oFormat.format(123456.789, "Bitcoin"), "Ƀ" + "\xa0" + "123,456.789", "Ƀ\xa0123,456.789 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// symbol lookup in CLDR
		assert.strictEqual(oFormat.format(123456.789, "EURO"), "€123,456.79", "€123,456.79 - symbol lookup in CLDR");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "EURO")), [123456.79, "EURO"], "[123456.79, 'EURO']");

		// currency symbol is n/a in the options
		assert.strictEqual(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies with symbol from global config", function (assert) {
		Formatting.addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			},
			"Bitcoin": {
				"digits": 3
			},
			"DOLLAR": {
				"digits": 4
			}
		});

		var oFormat = getCurrencyInstance({
			currencyCode: false
		});

		assert.strictEqual(oFormat.format(123456.789, "BTC"), "Ƀ" + "\xa0" + "123,456.79", "Ƀ\xa0123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.strictEqual(oFormat.format(123456.789, "Bitcoin"), "Bitcoin" + "\xa0" + "123,456.789", "Bitcoin\xa0123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.strictEqual(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies from global config", function (assert) {
		Formatting.addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			},
			"Bitcoin": {
				"digits": 3
			},
			"DOLLAR": {
				"digits": 4
			}
		});

		var oFormat = getCurrencyInstance({
			currencyCode: true
		});

		assert.strictEqual(oFormat.format(123456.789, "BTC"), "BTC" + "\xa0" + "123,456.79", "Ƀ\xa0123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.strictEqual(oFormat.format(123456.789, "Bitcoin"), "Bitcoin" + "\xa0" + "123,456.789", "Bitcoin\xa0123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.strictEqual(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.module("Custom currencies - exclusive behaviour", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Custom Currencies instance overwrites global configuration", function (assert) {
		// global configuration
		Formatting.addCustomCurrencies({
			"DOLLAR": {
				"symbol": "$",
				"digits": 5
			}
		});

		var oCustomCurrencyOptions = {
			"DOLLAR": {
				"symbol": "$",
				"decimals": 3
			}
		};

		var oFormat1, oFormat2;
		oFormat1 = getCurrencyInstance({
			customCurrencies: oCustomCurrencyOptions
		});

		oFormat2 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: oCustomCurrencyOptions
		});

		assert.strictEqual(oFormat1.format(12345.6789, "DOLLAR"), "DOLLAR" + "\xa0" + "12,345.679", "DOLLAR 12,345.679");
		assert.deepEqual(oFormat1.parse(oFormat1.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		// Parse with symbol
		assert.deepEqual(oFormat1.parse("$12,345.679"), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		assert.strictEqual(oFormat2.format(12345.6789, "DOLLAR"), "$12,345.679", "$12,345.679");
		assert.deepEqual(oFormat2.parse(oFormat2.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");
	});

	QUnit.module("Custom currencies - complex cases", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Currencies with numbers in their names Edge Cases", function(assert) {
		// showMeasure: true
		var oFormatEN = getCurrencyInstance({
			customCurrencies: {
				"1":{"decimals":1,"isoCode":""},
				"EUR":{"decimals":2,"isoCode":"EUR"}
			},
			unitOptional: false,
			parseAsString: true,
			trailingCurrencyCode:true,
			currencyCode: true,
			showMeasure: true
		});

		assert.deepEqual(oFormatEN.format("2", "EUR"), "2.00" + "\xa0" + "EUR", "2.00 EUR");
		assert.deepEqual(oFormatEN.format("2", "1"), "2.0" + "\xa0" + "1", "2.0 1");

		// can only be parsed if there is no "1" in the value to be parsed
		assert.deepEqual(oFormatEN.parse("10"), null, "10 contains currency 1");
		assert.deepEqual(oFormatEN.parse("20"), ["20", undefined], "does not contain currency 1");
		assert.deepEqual(oFormatEN.parse("21"), ["2", "1"], "21 contains currency at the end");
		assert.deepEqual(oFormatEN.parse("45167"), ["4567", "1"], "currency contains it in the middle");

		// showMeasure: false
		var oFormatENNoMeasure = getCurrencyInstance({
			customCurrencies: {
				"1":{"decimals":1,"isoCode":""},
				"EUR":{"decimals":2,"isoCode":"EUR"}
			},
			unitOptional: false,
			parseAsString: true,
			trailingCurrencyCode:true,
			currencyCode: true,
			showMeasure: false
		});

		// can be parsed because with showMeasure false currency is not parsed
		assert.deepEqual(oFormatENNoMeasure.parse("10"), ["10", undefined], "10");
		assert.deepEqual(oFormatENNoMeasure.parse("20"), ["20", undefined], "20");
		assert.deepEqual(oFormatENNoMeasure.parse("21"), ["21", undefined], "21");
		assert.deepEqual(oFormatENNoMeasure.parse("212"), ["212", undefined], "212");
		assert.deepEqual(oFormatENNoMeasure.parse("45167"), ["45167", undefined], "45167");
	});

	QUnit.test("Currencies with numbers in their names", function(assert) {
		// English
		var oFormatEN = getCurrencyInstance({
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		});

		// these assertion also check if the longest match is found
		assert.strictEqual(oFormatEN.format(1234.5678, "4DOL"), "4DOL" + "\xa0" + "1,234.57", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("4DOL 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("4DOL1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		// smaller match should win
		assert.strictEqual(oFormatEN.format(1234.5678, "DO"), "DO" + "\xa0" + "1,234.5678", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO 1,234.5678"), [1234.5678, "DO"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO1,234.56789"), [1234.56789, "DO"], "parse in English locale - number at the start - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "D4OL"), "D4OL" + "\xa0" + "1,234.6", "format in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "DOL4" + "\xa0" + "1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL4 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL41,234.568"), null, "parse in English locale - number at the end - no delimiter");

		// negative values
		assert.strictEqual(oFormatEN.format(-1234.56789, "DO"), "DO" + "\ufeff" + "-1,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("DO -1,234.568"), [-1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("DO-1,234.568"), [-1234.568, "DO"], "parse in English locale - short match - no delimiter");

		// reserved chars "." and ","
		assert.deepEqual(oFormatEN.parse("DOL4.568"), null, "parse in English locale - number at the end - not valid");
		assert.deepEqual(oFormatEN.parse("DOL4,234.568"), null, "parse in English locale - number at the end - not valid");

		// German
		var oFormatDE = getCurrencyInstance({
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		// these assertation also check if the longest match is found
		assert.strictEqual(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "4DOL", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 4DOL"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,574DOL"), null, "parse in German locale - number at the start - no delimiter");

		// smaller match should win
		assert.strictEqual(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "DO", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,5678 DO"), [1234.5678, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,56789DO"), [1234.56789, "DO"], "parse in German locale - short match - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "D4OL", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "DOL4", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		// negative values
		assert.strictEqual(oFormatDE.format(-1234.56789, "DO"), "-1.234,5679" + "\xa0" + "DO", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568 DO"), [-1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568DO"), [-1234.568, "DO"], "parse in German locale - short match - no delimiter");

		// reserved chars "." and ","
		assert.deepEqual(oFormatDE.parse("568,4DOL"), null, "parse in German locale - number at the start - not valid");
		assert.deepEqual(oFormatDE.parse("568.4DOL"), null, "parse in German locale - number at the start - not valid");
	});

	QUnit.test("Currencies with numbers in their names - currencyCode: false", function(assert) {
		// English
		var oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DO": {
					"symbol": "My#",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"isoCode": "USD",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!!",
					"decimals": 2
				}
			}
		});

		assert.strictEqual(oFormatEN.format(1234.5678, "4DOL"), "!!\xa01,234.57", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("!! 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("!!1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "D4OL"), "§\xa01,234.6", "format in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("§ 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("§1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.56789, "DO"), "My#\xa01,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My# 1,234.568"), [1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My#1,234.568"), [1234.568, "DO"], "parse in English locale - short match - no delimiter");

		assert.strictEqual(oFormatEN.format(-1234.5678, "DOL4"), "$" + "\ufeff" + "-1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ -1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$-1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.strictEqual(oFormatEN.format(-1234.56789, "DO"), "My#" + "\ufeff" + "-1,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My# -1,234.568"), [-1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My#-1,234.568"), [-1234.568, "DO"], "parse in English locale - short match - no delimiter");

		// German
		var oFormatDE = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DO": {
					"symbol": "My#",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"isoCode": "USD",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "!!", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 !!"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57!!"), [1234.57, "4DOL"], "parse in German locale - number at the start - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "§", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 §"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6§"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 $"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568$"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568 My#"), [1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568My#"), [1234.568, "DO"], "parse in German locale - short match - no delimiter");

		assert.strictEqual(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568 $"), [-1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568$"), [-1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.strictEqual(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568 My#"), [-1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568My#"), [-1234.568, "DO"], "parse in German locale - short match - no delimiter");
	});

	QUnit.test("Currencies with numbers in their names - currencyContext: 'accounting'", function(assert) {
		// English
		var oFormatEN = getCurrencyInstance({
			currencyContext: "accounting",
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		});

		// these assertation also check if the longest match is found
		assert.strictEqual(oFormatEN.format(-1234.5678, "4DOL"), "(4DOL\xa01,234.57)", "format in English locale - number at the start");
		assert.strictEqual(oFormatEN.format(1234.5678, "4DOL"), "4DOL\xa01,234.57", "format in English locale - number at the start");

		// smaller match should win
		assert.strictEqual(oFormatEN.format(-1234.5678, "DO"), "(DO\xa01,234.5678)", "format in English locale - number at the start");
		assert.strictEqual(oFormatEN.format(1234.5678, "DO"), "DO\xa01,234.5678", "format in English locale - number at the start");

		assert.strictEqual(oFormatEN.format(-1234.5678, "D4OL"), "(D4OL\xa01,234.6)", "format in English locale - number in the middle");
		assert.strictEqual(oFormatEN.format(1234.5678, "D4OL"), "D4OL\xa01,234.6", "format in English locale - number in the middle");

		assert.strictEqual(oFormatEN.format(-1234.5678, "DOL4"), "(DOL4\xa01,234.568)", "format in English locale - number at the end");
		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "DOL4\xa01,234.568", "format in English locale - number at the end");

		// German
		var oFormatDE = getCurrencyInstance({
			currencyContext: "accounting",
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		// these assertation also check if the longest match is found
		assert.strictEqual(oFormatDE.format(1234.5678, "4DOL"), "1.234,57\xa04DOL", "format in German locale - number at the start");
		assert.strictEqual(oFormatDE.format(-1234.5678, "4DOL"), "-1.234,57\xa04DOL", "format in German locale - number at the start");

		// smaller match should win
		assert.strictEqual(oFormatDE.format(1234.5678, "DO"), "1.234,5678\xa0DO", "format in German locale - short match");
		assert.strictEqual(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678\xa0DO", "format in German locale - short match");

		assert.strictEqual(oFormatDE.format(1234.5678, "D4OL"), "1.234,6\xa0D4OL", "format in German locale - number in the middle");
		assert.strictEqual(oFormatDE.format(-1234.5678, "D4OL"), "-1.234,6\xa0D4OL", "format in German locale - number in the middle");

		assert.strictEqual(oFormatDE.format(1234.5678, "DOL4"), "1.234,568\xa0DOL4", "format in German locale - number at the end");
		assert.strictEqual(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568\xa0DOL4", "format in German locale - number at the end");
	});

	QUnit.test("Currencies with numbers in their names - Log", function(assert) {
		var oLogSpy = this.spy(Log, "error");

		// English
		var oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DOL": {
					"symbol": "$",
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				}
			}
		});

		assert.ok(oLogSpy.calledOnceWith("Symbol '$' is defined multiple times in custom currencies.", undefined, "NumberFormat"),
			"Correct error log is displayed.");
		assert.strictEqual(oFormatEN.format(1234.5678, "DOL"), "$1,234.6", "format in English locale - number at the start");
		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the start");

		// restore spy
		oLogSpy.resetHistory();
	});

	//*****************************************************************************************************************
	QUnit.test("Parse custom currency codes, containing different kind of white spaces", function (assert) {
		var oFormat = getCurrencyInstance({
				customCurrencies : {
					"1XOF" : {digits : 2, symbol : "1F\u202fCFA"},
					XOF : {digits : 2, symbol : "F\u202fCFA"},
					XOF2 : {digits : 2, symbol : "F\u202fCFA2"}
				}
			}, new Locale("de"));

		const oLocalDataMock = this.mock(oFormat.oLocaleData);
		const fnOriginalGetDecimalFormat = oFormat.oLocaleData.getDecimalFormat;
		oLocalDataMock.expects("getDecimalFormat")
			.withExactArgs(sinon.match.string, sinon.match.string, sinon.match.string)
			.atLeast(1)
			.callsFake(function () { // inject RTL codes in the pattern retrieved from CLDR
				const sRTLCodes = "\u061c\u200e\u200f\u202a\u202b\u202c";
				const sFormat = fnOriginalGetDecimalFormat.apply(this, arguments);
				return sFormat && (sFormat.replace(" ", sRTLCodes + " ") + sRTLCodes);
		});
		assert.deepEqual(oFormat.parse("2000 F CFA"), [2000, "XOF"]);
		assert.deepEqual(oFormat.parse("2000 F\x0aCFA"), [2000, "XOF"]);
		assert.deepEqual(oFormat.parse("2 Mio. F\x0aCFA"), [2000000, "XOF"]);
		assert.deepEqual(oFormat.parse("2000 F CFA2"), [2000, "XOF2"]);
		assert.deepEqual(oFormat.parse("2000 F\xa0CFA2"), [2000, "XOF2"]);
		assert.deepEqual(oFormat.parse("2 Mio. F\xa0CFA2"), [2000000, "XOF2"]);
		assert.deepEqual(oFormat.parse("2000 1F CFA"), [2000, "1XOF"]);
		assert.deepEqual(oFormat.parse("2000 1F\xa0CFA"), [2000, "1XOF"]);
		assert.deepEqual(oFormat.parse("2 Mio. 1F\xa0CFA"), [2000000, "1XOF"]);
	});

	QUnit.module("Custom currencies - Ambiguous currency information", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Multiple custom currencies with same currency symbol", function(assert) {
		var oFormat = getCurrencyInstance({
			customCurrencies: {
				"IOTA": {
					decimals: 3,
					symbol: "y"
				},
				"MON": {
					decimals: 2,
					symbol: "µ"
				},
				"MONERO": {
					decimals: 5,
					symbol: "µ"
				}
			}
		});

		assert.strictEqual(oFormat.format(12345.6789, "MON"), "MON" + "\xa0" + "12,345.68", "MON 12,345.68");
		assert.strictEqual(oFormat.format(12345.6789, "MONERO"), "MONERO" + "\xa0" + "12,345.67890", "MONERO 12,345.6789");
		assert.deepEqual(oFormat.parse("µ12,345.679"), [12345.679, undefined], "[12345.679, undefined] returned.");

		var oFormat2 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"EUR5": {
					"isoCode": "EUR",
					decimals: 5
				},
				"EU": {
					symbol: "€",
					decimals: 2
				}
			}
		});

		assert.strictEqual(oFormat2.format(12345.6789, "EUR5"), "€12,345.67890", "€12,345.68");
		assert.strictEqual(oFormat2.format(12345.6789, "EU"), "€12,345.68", "€12,345.6789");
		assert.deepEqual(oFormat2.parse("€12,345.679"), [12345.679, undefined], "[12345.679, undefined] returned.");
	});

	QUnit.test("Duplicated symbol defined via custom currency", function(assert) {
		Formatting.setCustomCurrencies({
			"EURO": {
				"digits": 5,
				"isoCode": "EUR"
			}
		});

		var oFormat = getCurrencyInstance({
			currencyCode: false
		});

		assert.deepEqual(oFormat.parse("€12,345.679"), [12345.679, undefined], "Duplicated symbol found");
	});

	QUnit.test("Currency that is named with digits only", function(assert) {
		var oFormat = getCurrencyInstance({
			showNumber: true,
			showMeasure: true,
			customCurrencies: {
				"180": {
					decimals: 2
				}
			}
		});

		assert.strictEqual(oFormat.format(170123.45, "180"), "180\xa0170,123.45", "formatting [123, '180']");

		assert.deepEqual(oFormat.parse("180\xa0170,123.45"), [170123.45, "180"], "parsing 170,123.45 (value from format)");
		assert.deepEqual(oFormat.parse("170,123.45"), [170123.45, undefined], "parsing 170,123.45 (with thousands separator)");
		assert.deepEqual(oFormat.parse("170123.45"), [170123.45, undefined], "parsing 170123.45 (without separator)");
		assert.deepEqual(oFormat.parse("180,123.45"), null, "parsing 180,123.45 (with thousands separator) not possible because currencies which consist only of digits aren't supported");
		assert.deepEqual(oFormat.parse("180123.45"), null, "parsing 180123.45 (without separator) not possible because currencies which consist only of digits aren't supported");
	});

	QUnit.test("Currencies with undefined symbol", function(assert) {
		var oSpy = this.spy(Log, "error");

		var oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					symbol: "Ƀ"
				},
				"Bitcoin": {
					isoCode: "foo",
					"decimals": 3
				},
				"DOLLAR": {
					isoCode: "foo",
					"decimals": 4
				}
			}
		});

		assert.strictEqual(oFormat.format(123, "Bitcoin"), "Bitcoin\xa0123.000");

		assert.strictEqual(oSpy.callCount, 0, "Error log for duplicated currencies was was not called");

		oSpy.restore();
	});

	QUnit.test("decimals = 0", function (assert) {
		var oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€",
					decimals: 0
				}
			}
		});
		assert.strictEqual(oFormatEN.format(undefined, undefined), "", "no values returns an empty string - en");
		assert.strictEqual(oFormatEN.format(1234.56, undefined), "1,234.56", "only number formatted - en");
		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,235", "formatted both - en");

		var oFormatDE = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"HOD": {
					symbol: "H$",
					decimals: 0
				}
			}
		}, new Locale("de"));
		assert.strictEqual(oFormatDE.format(undefined, undefined), "", "no values returns an empty string - de");
		assert.strictEqual(oFormatDE.format(1234.56, undefined), "1.234,56", "only number formatted - de");
		assert.strictEqual(oFormatDE.format(1234.5728, "HOD"), "1.235" + "\xa0" + "H$", "formatted both - de");
	});

	QUnit.module("Custom currencies - parseAsString: true", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Parse simple number", function(assert) {
		var oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});

		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "123.457"), ["123.457", "DOLLAR"], "['123.457', 'DOLLAR']");

		// Ingnore decimal setting (5) for the IOTA currency
		assert.deepEqual(oFormat.parse("IOTA" + "\xa0" + "123.45788888"), ["123.45788888", "IOTA"], "['123.4578888', 'IOTA']");

		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "123,456.789"), ["123456.789", "DOLLAR"], "['123456.789', 'DOLLAR']");

		// Max safe integer (2^53)-1  ->  9007199254740991
		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "9,007,199,254,740,991.000"), ["9007199254740991.000", "DOLLAR"], "['9007199254740991.000', 'DOLLAR']");

		// Larger than max safe integer
		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "9,007,199,254,740,991,678.000"), ["9007199254740991678.000", "DOLLAR"], "['9007199254740991678.000', 'DOLLAR']");
	});

	QUnit.test("Parse negative number (with and w/o invisible non-breaking space)", function(assert) {
		var oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});
		assert.deepEqual(oFormat.parse("DOLLAR-123.457"), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("DOLLAR" + "\ufeff" + "-123.457"), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");

		assert.deepEqual(oFormat.parse(oFormat.format(-123.457, "DOLLAR")), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");
	});

	QUnit.test("Parse simple number with symbol", function(assert) {
		var oFormat = getCurrencyInstance({
			currencyCode: false,
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 4,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$123.457"), ["123.457", "DOLLAR"], "['123.457', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("y123.457"), ["123.457", "IOTA"], "['123.457', 'IOTA']");

		// Don't show thousands separator in parsing result
		assert.deepEqual(oFormat.parse("$123,456.789"), ["123456.789", "DOLLAR"], "['123456.789', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("y 123,456.789"), ["123456.789", "IOTA"], "['123456.789', 'IOTA']");
		assert.deepEqual(oFormat.parse("y123,456.789"), ["123456.789", "IOTA"], "['123456.789', 'IOTA']");
	});

	QUnit.test("Parse unknown currency", function (assert) {
		var oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		});

		assert.deepEqual(oFormat.parse("EUR 123456,789"), null, "null is returned.");
	});

	QUnit.test("Parse symbol only", function (assert) {
		var oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"Dollar": {
					"decimals": 5,
					"symbol": "$"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$"), null, "Null is returned.");
	});

	QUnit.module("Standard Currency Formatting", {
		afterEach: function() {
			// reset global configuration
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Currency format with showMeasure true and currencyContext accounting", function (assert) {
		var oFormat = getCurrencyInstance({
			showMeasure: true,
			currencyContext: "accounting"
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "(EUR" + "\xa0" + "123,456.79)", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "(EUR" + "\xa0" + "123,456.79)", "123456.789 EUR");
	});

	QUnit.test("Currency format with showMeasure false and currencyContext accounting", function (assert) {
		var oFormat = getCurrencyInstance({
			showMeasure: false,
			currencyContext: "accounting"
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "(123,456.79)", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "(123,456.79)", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeasure specific locale ko", function (assert) {
		// The currency pattern is definde in "ko" as: ¤#,##0.00;(¤#,##0.00) where the pattern after ';'
		// should be used for negative numbers.
		var oLocale = new Locale("ko");
		var oFormat = getCurrencyInstance({
			currencyContext: "accounting"
		}, oLocale);

		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "(EUR" + "\xa0" + "123,456.79)", "-123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "(EUR" + "\xa0" + "123,456.79)", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and set decimal option to overwrite the default number of decimal", function (assert) {
		var oFormat = getCurrencyInstance({
			decimals: 1
		});

		assert.strictEqual(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.8", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.8", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.8", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.8", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and the precision option should be ignored", function (assert) {
		var oFormat = getCurrencyInstance({
			precision: 7
		});

		assert.strictEqual(oFormat.format(123456, "EUR"), "EUR" + "\xa0" + "123,456.00", "123456 EUR");
		assert.strictEqual(oFormat.format([123456.7, "EUR"]), "EUR" + "\xa0" + "123,456.70", "123456.7 EUR");
		assert.strictEqual(oFormat.format(-123456.78, "EUR"), "EUR" + "\ufeff" + "-123,456.78", "-123456.78 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and style short. The default precision option shouldn't be ignored", function (assert) {
		var oFormat = getCurrencyInstance({
			style: "short"
		});

		assert.strictEqual(oFormat.format(123456, "EUR"), "EUR" + "\xa0" + "123K", "123456 EUR");
		assert.strictEqual(oFormat.format([1234567.8, "EUR"]), "EUR" + "\xa0" + "1.2M", "123456.7 EUR");
		assert.strictEqual(oFormat.format(12345678.9, "EUR"), "EUR" + "\xa0" + "12M", "-123456.78 EUR");
	});

	QUnit.test("check space between currency code and number in different scenarios", function (assert) {
		// in "en-US" locale there's no space in the currency pattern
		// space should be inserted when it's necessary
		var oCurrencyCodeFormatter = getCurrencyInstance(),
			oCurrencySymbolFormatter = getCurrencyInstance({
				currencyCode: false
			});

		assert.strictEqual(oCurrencyCodeFormatter.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "€\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "HKD"), "HK$123,456.79", "123456.789 HKD");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "HK$\ufeff-123,456.79", "-123456.789 HKD");

		// in "de-DE" locale there's already space in the currency pattern: #,##0.00 ¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = getCurrencyInstance(new Locale("de-DE"));
		oCurrencySymbolFormatter = getCurrencyInstance({
			currencyCode: false
		}, new Locale("de-DE"));

		assert.strictEqual(oCurrencyCodeFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "EUR", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "€", "123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "€", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "HKD"), "123.456,79" + "\xa0" + "HK$", "123456.789 HKD");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "-123.456,79" + "\xa0" + "HK$", "-123456.789 HKD");

		// in "uk" locale there's no space in the currency pattern and the symbol is at the end: #,##0.00¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = getCurrencyInstance({
			currencyContext: "accounting"
		}, new Locale("uk"));
		oCurrencySymbolFormatter = getCurrencyInstance({
			currencyCode: false,
			currencyContext: "accounting"
		}, new Locale("uk"));

		assert.strictEqual(oCurrencyCodeFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0" + "UAH", "123456.789 UAH");
		assert.strictEqual(oCurrencyCodeFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0" + "UAH", "-123456.789 UAH");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0\u20b4", "123456.789 UAH");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0\u20b4", "-123456.789 UAH");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "UAK"), "123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "123456.789 UAK");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "UAK"), "-123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "-123456.789 UAK");
	});


	QUnit.test("Parse special characters (RTL) in currency string", function (assert) {
		var oLocale = new Locale("he");
		var oFormatter = getCurrencyInstance({
			showMeasure: false,
			parseAsString: true

		}, oLocale);

		assert.deepEqual(oFormatter.parse("702.00"), ["702.00", undefined], "can be parsed properly");
		// from hebrew
		assert.deepEqual(oFormatter.parse("\u200f702.00\u200e"), ["702.00", undefined], "rtl character wrapped number can be parsed properly");
	});

[
	{locale : "en", code : "EUR", result : "€42.00", context : "accounting"},
	{locale : "en", code : "AED", result : "42.00\u00a0AED", context : "sap-accounting"},
	{locale : "ar", code : "AED", result : "\u200f42.00\u00a0\u202aد.إ.\u200f\u202c", context : "sap-standard"},
	{locale : "ar", code : "AED", result : "\u200f42.00\u00a0\u202bد.إ.\u200f\u200e\u202c", context : "standard"},
	{locale : "ar", code : "AED", result : "\u061c42.00\u202bد.إ.\u200f\u200e\u202c", context : "accounting"}
].forEach((oFixture) => {// JIRA: CPOUI5MODELS-1502
	const sTitle = `Format and parse (RTL): ${oFixture.locale}, ${oFixture.code}, ${oFixture.context}`;
	QUnit.test(sTitle, function (assert) {
		const oLocale = new Locale(oFixture.locale);
		const oFormatter = NumberFormat.getCurrencyInstance({currencyCode: false,
			currencyContext : oFixture.context}, oLocale);

		// code under test: format -> code to symbol
		const sValue = oFormatter.format(42, oFixture.code);
		assert.strictEqual(sValue, oFixture.result);

		// code under test: parse -> symbol to code
		assert.deepEqual(oFormatter.parse(sValue), [42, oFixture.code]);
	});
});

	QUnit.test("parse currency format", function (assert) {
		var oFormat = getCurrencyInstance();
		var aResult = oFormat.parse("EUR -12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -12345.67, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12,345.67 EURO");
		assert.strictEqual(aResult, null, "Currency parser should return null");

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -12345.67, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("USD23.4567");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 23.4567, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR");
		assert.strictEqual(aResult, null, "String with currency code only can't be parsed");

		aResult = oFormat.parse("1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], undefined, "Currency Code is parsed correctly: expected, parsed " + aResult[1]);

		aResult = oFormat.parse("€" + " 1,234,567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("$ 1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		// showMeasure false
		oFormat = getCurrencyInstance({
			showMeasure: false
		});

		assert.deepEqual(oFormat.parse("1"), [1, undefined], "1");
		assert.deepEqual(oFormat.parse("1.23"), [1.23, undefined], "1.23");
		assert.deepEqual(oFormat.parse("1234567.89"), [1234567.89, undefined], "1234567.89");

		// null values
		assert.deepEqual(oFormat.parse("x"), null, "x");
		assert.deepEqual(oFormat.parse("kg"), null, "kg");
		assert.deepEqual(oFormat.parse("XXX"), null, "XXX");
		assert.deepEqual(oFormat.parse("1 day"), null, "1 day");

		assert.strictEqual(oFormat.parse("-12,345.67 EUR"), null, "Currency with measure cannot be parsed");
		assert.strictEqual(oFormat.parse("USD23.4567"), null, "Currency with measure cannot be parsed");
		assert.strictEqual(oFormat.parse("EUR-1234567.89"), null, "Currency with measure cannot be parsed");
		assert.strictEqual(oFormat.parse("EUR"), null, "String with currency code only can't be parsed");

		oFormat = getCurrencyInstance({
			parseAsString: true
		});

		aResult = oFormat.parse("EUR-12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-00012,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], "-12345678901123456.78", "Long number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], "-12345678901123456345678901123456.78", "Ridiculously long number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		oFormat = getCurrencyInstance({}, new Locale("de"));
		aResult = oFormat.parse("-12.345,67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -12345.67, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("23,4567 USD");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 23.4567, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("23,4567 $");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 23.4567, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("-1234567,89EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

	});

	QUnit.test("parse currency with a currency code having more than or less than 3 letters", function (assert) {
		var oFormat = getCurrencyInstance();
		var aResult = oFormat.parse("EURO 1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EU 1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EUR1,234.00");
		assert.deepEqual(aResult, [1234, "EUR"], "[1234, 'EUR']");

		aResult = oFormat.parse("EURO1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EU1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		// de locale
		oFormat = getCurrencyInstance({}, new Locale("de"));
		aResult = oFormat.parse("1.234,00 EU");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00 EURO");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EURO");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EU");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EUR");
		assert.deepEqual(aResult, [1234, "EUR"], "[1234, 'EUR']");


	});

	QUnit.test("parse currency short format", function (assert) {
		var oFormat = getCurrencyInstance();
		var aResult = oFormat.parse("GBP 5");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 5, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "GBP", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("SEK 6");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 6, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "SEK", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("12 EUR K");
		assert.strictEqual(aResult, null, "Currency between number and scale cannot be parsed");

		aResult = oFormat.parse("EUR-12K");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -12000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12K EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -12000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("USD23M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 23000000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR -12 million");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], -12000000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 0.00T");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 0, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 0.2M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 200000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);
	});

	QUnit.test("currency for 'he' locale with big number. Contains the RTL character u+200F", function (assert) {
		//setup
		var oLocale = new Locale("he");
		var oFormat = getCurrencyInstance({
			showMeasure: false
		}, oLocale);

		// input and output
		var iExpectedNumber = 50000;

		// execution
		var sFormatted = oFormat.format(iExpectedNumber);
		assert.strictEqual(sFormatted, "\u200f50,000.00\u00a0\u200f\u200e",
			"can be formatted '" + sFormatted + "' (contains RTL character)");

		var aParsed = oFormat.parse(sFormatted);
		assert.deepEqual(aParsed, [50000, undefined], "should match input number " + iExpectedNumber);
	});

	QUnit.test("currency format/parse for currencies with letter 'K' in the measure symbol", function(assert) {
		//setup
		var oLocale = new Locale("en");
		var oFormat = getCurrencyInstance({
			showMeasure: true
		}, oLocale);


		["SEK", "DKK"].forEach(function(sCurrencyMeasure) {

			// input and output
			var iExpectedNumber = 12345;
			assert.ok(iExpectedNumber, "Input: " + iExpectedNumber + ", " + sCurrencyMeasure);

			// execution
			var sFormatted = oFormat.format(iExpectedNumber, sCurrencyMeasure);
			assert.ok(sFormatted, "Formatted: " + sFormatted);

			var aParsed = oFormat.parse(sFormatted);
			assert.deepEqual(aParsed, [iExpectedNumber, sCurrencyMeasure], "Parsed: " + aParsed.join(", "));
		});
	});

	QUnit.test("format/parse indian lakhs/crores", function (assert) {
		var oLocale = new Locale("en-IN");
		var oFormat = getCurrencyInstance({}, oLocale);
		var oFormatGroupingValidation = getCurrencyInstance({style: "short", strictGroupingValidation: true}, oLocale);

		assert.strictEqual(oFormat.format(100000, "INR"), "INR\xa01,00,000.00", "INR is formatted with correct grouping");
		assert.deepEqual(oFormat.parse("INR\xa01,00,000.00"), [100000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(10000000, "INR"), "INR\xa01,00,00,000.00", "INR is formatted with correct grouping");
		assert.deepEqual(oFormat.parse("INR\xa01,00,00,000.00"), [10000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(10000000000, "INR"), "INR\xa010,00,00,00,000.00", "INR is formatted with correct grouping");
		assert.deepEqual(oFormat.parse("INR\xa010,00,00,00,000.00"), [10000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(1000000000000, "INR"), "INR\xa010,00,00,00,00,000.00", "INR is formatted with correct grouping");
		assert.deepEqual(oFormat.parse("INR\xa010,00,00,00,00,000.00"), [1000000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(100000000000000, "INR"), "INR\xa010,00,00,00,00,00,000.00", "INR is formatted with correct grouping");
		assert.deepEqual(oFormat.parse("INR\xa010,00,00,00,00,00,000.00"), [100000000000000, "INR"], "INR is parsed with correct grouping");

		oFormat = getCurrencyInstance({ style: "short" }, oLocale);

		assert.strictEqual(oFormat.format(100000, "INR"), "INR\xa01 Lk", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 1 Lk"), [100000, "INR"], "INR is parsed with correct grouping");
		assert.deepEqual(oFormat.parse("INR\xa01 Lk"), [100000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(10000000, "INR"), "INR\xa01 Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 1 Cr"), [10000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(10000000000, "INR"), "INR\xa01,000 Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 1,000 Cr"), [10000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(1000000000000, "INR"), "INR\xa01 Lk Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 1 Lk Cr"), [1000000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(10000000000000, "INR"), "INR\xa010 Lk Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 10 Lk Cr"), [10000000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(100000000000000, "INR"), "INR\xa01 Cr Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 1 Cr Cr"), [100000000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(100000000000000000, "INR"), "INR\xa01,000 Cr Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 1,000 Cr Cr"), [100000000000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(100000000000000000000, "INR"), "INR\xa010,00,000 Cr Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 10,00,000 Cr Cr"), [100000000000000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(100000000000000000000000, "INR"), "INR\xa01,00,00,00,000 Cr Cr", "INR is formatted as Lk/Cr");
		assert.deepEqual(oFormat.parse("INR 1,00,00,00,000 Cr Cr"), [100000000000000000000000, "INR"], "INR is parsed with correct grouping");
		assert.deepEqual(oFormat.parse("INR 1 00 00 00 000 Cr Cr"), [100000000000000000000000, "INR"], "INR is parsed with correct grouping");
		assert.deepEqual(oFormat.parse("INR 1000000000 Cr Cr"), [100000000000000000000000, "INR"], "INR is parsed with correct grouping");

		assert.strictEqual(oFormat.format(100000, "USD"), "USD\xa0100K", "USD is formatted as M/B/T");
		assert.strictEqual(oFormat.format(1000000, "USD"), "USD\xa01M", "USD is formatted as M/B/T");
		assert.strictEqual(oFormat.format(1000000000, "USD"), "USD\xa01B", "USD is formatted as M/B/T");

		var aResult = oFormat.parse("INR 12 Lk");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 1200000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("12 Lk INR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 1200000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("INR 12 Cr");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 120000000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 12M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.strictEqual(aResult[0], 12000000, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		// correct grouping: INR 100,00,00,000 Cr Cr

		// tolerated, as single separator with grouping base size (assumingly a grouping separator)
		assert.deepEqual(oFormat.parse("INR 100 00 00,000 Cr Cr"), [1e+23, "INR"], "missing grouping");

		// not tolerated, because single separator with wrong grouping base size (assumingly a decimal separator)
		assert.deepEqual(oFormat.parse("INR 100 00,00 000 Cr Cr"), null, "Parse 'INR 100 00,00 000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 100,00 00 000 Cr Cr"), null, "Parse 'INR 100,00 00 000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1,00 00 00 000 Cr Cr"), null, "Parse 'INR 1,00 00 00 000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 100 00 00 0,00 Cr Cr"), null, "Parse 'INR 100 00 00 0,00 Cr Cr'");

		// grouping validation
		// exactly one grouping separator is present and the one at the most right is missing
		// this means it could have been confused with the decimal separator
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100 00,00 000 Cr Cr"), null, "grouping validation 'INR 100 00,00 000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100,00 00 000 Cr Cr"), null, "grouping validation: 'INR 100,00 00 000 Cr Cr'");

		// 2 or more separators are present at the correct position
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100,00 00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100,00 00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100,00,00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100,00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100,00,00 000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100,00,00 000 Cr Cr'");

		// 2 or more separators are present at the incorrect position
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,00 0,0 00 000 Cr Cr"), null, "Parse 'INR 1,00 0,0 00 000 Cr Cr'");

		// wrong grouping position
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100 00 00 0,00 Cr Cr"), null, "Parse 'INR 100 00 00 0,00 Cr Cr'");

		// tolerated, despite wrong grouping, because of multiple grouping separators
		// correct formatted: INR 100,00,00,000 Cr Cr
		// 2 grouping separators present
		assert.deepEqual(oFormat.parse("INR 1,00,00 000 Cr Cr"), [1e+21, "INR"], "Parse 'INR 1,00,00 000 Cr Cr'");
		// 1 present at the most right
		assert.deepEqual(oFormat.parse("INR 1 00,000 Cr Cr"), [1e+19, "INR"], "Parse 'INR 1 00,000 Cr Cr'");
		// 1 present at the most right missing
		assert.deepEqual(oFormat.parse("INR 1,00 000 Cr Cr"), null, "Parse 'INR 1,00 000 Cr Cr'");

		// wrong position
		assert.deepEqual(oFormat.parse("INR 10 0,0,0 Cr Cr"), [1e+18, "INR"], "Parse 'INR 10 0,0,0 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1,00,0 Cr Cr"), [1e+17, "INR"], "Parse 'INR 1,00,0 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 10,00,0 Cr Cr"), [1e+18, "INR"], "Parse 'INR 10,00,0 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1,0 000 Cr Cr"), null, "Parse 'INR 1,0 000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 10 0,00 Cr Cr"), null, "Parse 'INR 10 0,00 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 10 00,0 Cr Cr"), null, "Parse 'INR 10 00,0 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR ,1000 Cr Cr"), null, "Parse 'INR ,1000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1000, Cr Cr"), null, "Parse 'INR 1000, Cr Cr'");


		assert.deepEqual(oFormat.parse("INR 100,00 00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100,00 00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 100 00,00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100 00,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 100,00,00 000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100,00,00 000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1,00,00,00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 1,00,00,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 10,000,00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 10,000,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 10,000,000,00 Cr Cr"), [1e+23, "INR"], "Parse 'INR 10,000,000,00 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1,00,00,00000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 1,00,00,00000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1,00 00,00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 1,00 00,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("INR 1,00,00 00 000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 1,00,00 00 000 Cr Cr'");


		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,0 000 Cr Cr"), null, "Parse 'INR 1,0 000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 10 0,00 Cr Cr"), null, "Parse 'INR 10 0,00 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 10 00,0 Cr Cr"), null, "Parse 'INR 10 00,0 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 10 0,0,0 Cr Cr"), null, "Parse 'INR 10 0,0,0 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 10,00,0 Cr Cr"), null, "Parse 'INR 10,00,0 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,00,0 Cr Cr"), null, "Parse 'INR 1,00,0 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR ,1000 Cr Cr"), null, "Parse 'INR ,1000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1000, Cr Cr"), null, "Parse 'INR 1000, Cr Cr'");

		assert.deepEqual(oFormatGroupingValidation.parse("INR 100,00 00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100,00 00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100 00,00,000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100 00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 100,00,00 000 Cr Cr"), [1e+23, "INR"], "Parse 'INR 100,00,00 000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,000,00,00,000 Cr Cr"), null, "Parse 'INR 1,000,00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,000,00,00,000 Cr Cr"), null, "Parse 'INR 1,000,00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 10,000,000,00 Cr Cr"), null, "Parse 'INR 10,000,000,00 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,000,00,00000 Cr Cr"), null, "Parse 'INR 1,000,00,00000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,000 00,00,000 Cr Cr"), null, "Parse 'INR 1,000 00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("INR 1,000,00 00 000 Cr Cr"), null, "Parse 'INR 1,000,00 00 000 Cr Cr'");
	});

	QUnit.test("format/parse INR with Indian locale", function (assert) {
		var oFormatCurrency = getCurrencyInstance({strictGroupingValidation: true}, new Locale("en-IN"));

		// valid
		assert.deepEqual(oFormatCurrency.parse("INR 1"), [1e+0, "INR"], "validate 'INR 1'");
		assert.deepEqual(oFormatCurrency.parse("INR 10"), [1e+1, "INR"], "validate 'INR 10'");
		assert.deepEqual(oFormatCurrency.parse("INR 100"), [1e+2, "INR"], "validate 'INR 100'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000"), [1e+3, "INR"], "validate 'INR 1,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,000"), [1e+4, "INR"], "validate 'INR 10,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00,000"), [1e+5, "INR"], "validate 'INR 1,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 00,000"), [1e+5, "INR"], "validate 'INR 1 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00,000"), [1e+6, "INR"], "validate 'INR 10,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00,000"), [1e+6, "INR"], "validate 'INR 10 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00,00,000"), [1e+7, "INR"], "validate 'INR 1,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 00,00,000"), [1e+7, "INR"], "validate 'INR 1 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 00 00,000"), [1e+7, "INR"], "validate 'INR 1 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00 00,000"), [1e+7, "INR"], "validate 'INR 1,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00,00,000"), [1e+8, "INR"], "validate 'INR 10,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00,00,000"), [1e+8, "INR"], "validate 'INR 10 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00 00,000"), [1e+8, "INR"], "validate 'INR 10 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00 00,000"), [1e+8, "INR"], "validate 'INR 10,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 100,00,00,000"), [1e+9, "INR"], "validate 'INR 100,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 100 00 00,000"), [1e+9, "INR"], "validate 'INR 100 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 100,00 00,000"), [1e+9, "INR"], "validate 'INR 100,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 100 00,00,000"), [1e+9, "INR"], "validate 'INR 100 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00,00,00,000"), [1e+10, "INR"], "validate 'INR 10,00,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00,00 00,000"), [1e+10, "INR"], "validate 'INR 10,00,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00 00 00,000"), [1e+10, "INR"], "validate 'INR 10,00 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00 00 00,000"), [1e+10, "INR"], "validate 'INR 10 00 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00,00 00,000"), [1e+10, "INR"], "validate 'INR 10 00,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00 00,00,000"), [1e+10, "INR"], "validate 'INR 10 00 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00,00,00,00,000"), [1e+11, "INR"], "validate 'INR 1,00,00,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00,00 00 00,000"), [1e+11, "INR"], "validate 'INR 1,00,00 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 00,00,00 00,000"), [1e+11, "INR"], "validate 'INR 1 00,00,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00,00,00,00,000"), [1e+12, "INR"], "validate 'INR 10,00,00,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00,00,00 00,000"), [1e+12, "INR"], "validate 'INR 10 00,00,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00,00 00,00,000"), [1e+12, "INR"], "validate 'INR 10 00,00 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00,00,00,00,00,000"), [1e+13, "INR"], "validate 'INR 1,00,00,00,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00 00,00,00 00,000"), [1e+13, "INR"], "validate 'INR 1,00 00,00,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 00 00 00 00 00,000"), [1e+13, "INR"], "validate 'INR 1 00 00 00 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00 00 00 00 00,000"), [1e+14, "INR"], "validate 'INR 10 00 00 00 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00 00 00 00,00,000"), [1e+14, "INR"], "validate 'INR 10 00 00 00 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10 00 00 00,00,00,000"), [1e+14, "INR"], "validate 'INR 10 00 00 00,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00,00,00 00 00 000"), [1e+14, "INR"], "validate 'INR 10,00,00,00 00 00 000'");

		// invalid
		assert.deepEqual(oFormatCurrency.parse("INR ,1"), null, "validate 'INR ,1'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,0"), null, "validate 'INR 1,0'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00"), null, "validate 'INR 1,00'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00"), null, "validate 'INR 10,00'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,0000"), null, "validate 'INR 1,0000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,0000"), null, "validate 'INR 10,0000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 0,0000"), null, "validate 'INR 1 0,0000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000,000"), null, "validate 'INR 1,000,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000 000"), null, "validate 'INR 1,000 000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,0,00,000"), null, "validate 'INR 10,0,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,0 00 00,000"), null, "validate 'INR 1,0 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000,00,00,000"), null, "validate 'INR 1,000,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000 00 00,000"), null, "validate 'INR 1,000 00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000,00 00,000"), null, "validate 'INR 1,000,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000 00,00,000"), null, "validate 'INR 1,000 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,000,00,00,000"), null, "validate 'INR 10,000,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,00 000,00 00,000"), null, "validate 'INR 1,00 000,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 00,000,00 00,000"), null, "validate 'INR 1 00,000,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,0,000,00,00,000"), null, "validate 'INR 10,0,000,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00 000,00 00,000"), null, "validate 'INR 10,00 000,00 00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1 000,000 00,00,000"), null, "validate 'INR 1 000,000 00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 1,000,000,00,00,000"), null, "validate 'INR 1,000,000,00,00,000'");
		assert.deepEqual(oFormatCurrency.parse("INR 10,00 000,00 00,000"), null, "validate 'INR 10,00 000,00 00,000'");

	});

	QUnit.test("format/parse EUR with Indian locale", function (assert) {
		var oLocale = new Locale("en-IN");
		var oFormat = getCurrencyInstance({style: "short"}, oLocale);
		var oFormatGroupingValidation = getCurrencyInstance({style: "short", strictGroupingValidation: true}, oLocale);

		// tolerated, despite wrong grouping, because of multiple grouping separators
		// correct formatted: EUR 1,00,00,00,000 Cr Cr
		assert.deepEqual(oFormat.parse("EUR 100,00 00,000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 100,00 00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 100 00,00,000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 100 00,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 100,00,00 000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 100,00,00 000 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 1,00,00,00,000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 1,00,00,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 10,000,00,000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 10,000,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 10,000,000,00 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 10,000,000,00 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 1,00,00,00000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 1,00,00,00000 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 1,00 00,00,000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 1,00 00,00,000 Cr Cr'");
		assert.deepEqual(oFormat.parse("EUR 1,00,00 00 000 Cr Cr"), [1e+23, "EUR"], "Parse 'EUR 1,00,00 00 000 Cr Cr'");

		// grouping validation
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 100,00 00,000 Cr Cr"), [1e+23, "EUR"], "validate 'EUR 100,00 00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 100 00,00,000 Cr Cr"), [1e+23, "EUR"], "validate 'EUR 100 00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 100,00,00 000 Cr Cr"), [1e+23, "EUR"], "validate 'EUR 100,00,00 000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 1,00,00,00,000 Cr Cr"), [1e+23, "EUR"], "validate 'EUR 1,00,00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 1,00,00,00000 Cr Cr"), [1e+23, "EUR"], "validate 'EUR 1,00,00,00000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 1,00 00,00,000 Cr Cr"), [1e+23, "EUR"], "validate 'EUR 1,00 00,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 1,00,00 00 000 Cr Cr"), [1e+23, "EUR"], "validate 'EUR 1,00,00 00 000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 10,000,00,000 Cr Cr"), null, "validate 'EUR 10,000,00,000 Cr Cr'");
		assert.deepEqual(oFormatGroupingValidation.parse("EUR 10,000,000,00 Cr Cr"), null, "validate 'EUR 10,000,000,00 Cr Cr'");
	});

	QUnit.test("getScale", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = getCurrencyInstance({style: "short", shortRefNumber: 1234}, oLocale);
		assert.strictEqual(oFormat.getScale(), "\u00a4\u00a0K", "scale is correctly retrieved");

		oFormat = getCurrencyInstance({style: "short"}, oLocale);
		assert.strictEqual(oFormat.getScale(), undefined, "scale not retrieved");

		oFormat = getCurrencyInstance({}, oLocale);
		assert.strictEqual(oFormat.getScale(), undefined, "scale not retrieved");

	});

	QUnit.test("Currency instantiation without format options", function (assert) {
		assert.ok(NumberFormat.getCurrencyInstance(), "instantiation without options should succeed");
	});

	//*****************************************************************************************************************
[true, false].forEach(function(bMock){
	QUnit.test("Currency spacing [[:^S:]&[:^Z:]] " + (bMock ? "with mock" : "without mock"), function (assert) {
		var oFormat = getCurrencyInstance({
				currencyCode : false,
				customCurrencies : {
					BasicChar : {decimals : 0, symbol : "foo"},
					CurrencySymbol : {decimals : 0, symbol : "$"},
					MathematicalSymbol : {decimals : 0, symbol : "+"},
					ModifierSymbol : {decimals : 0, symbol : "^"},
					OtherSymbol : {decimals : 0, symbol : "©"},
					LineSeparator : {decimals : 0, symbol : "$\u2028"},
					ParagraphSeparator : {decimals : 0, symbol : "$\u2029"},
					SpaceSeparator : {decimals : 0, symbol : "$\u3000"}
				}
			}, new Locale("en"));

		if (bMock) {
			this.mock(oFormat.oLocaleData).expects("getCurrencySpacing")
				.withExactArgs("after")
				.exactly(8)
				.returns({currencyMatch : "[[:^S:]&[:^Z:]]", insertBetween : "\xa0", surroundingMatch : "[:digit:]"});
		}

		assert.strictEqual(oFormat.format(2, "BasicChar"), "foo\xa02");
		assert.strictEqual(oFormat.format(2, "CurrencySymbol"), "$2");
		assert.strictEqual(oFormat.format(2, "LineSeparator"), "$\u2028" + "2");
		assert.strictEqual(oFormat.format(2, "ParagraphSeparator"), "$\u2029" + "2");
		assert.strictEqual(oFormat.format(2, "SpaceSeparator"), "$\u3000" + "2");

		// Symbols Sk (modifier), Sm (mathematical) and So (other) are not yet supported
		assert.strictEqual(oFormat.format(2, "MathematicalSymbol"), "+\xa02");
		assert.strictEqual(oFormat.format(2, "ModifierSymbol"), "^\xa02");
		assert.strictEqual(oFormat.format(2, "OtherSymbol"), "©\xa02");
	});
});

	//*****************************************************************************************************************
	QUnit.module("Support case insensitive input of currency codes", {
		beforeEach : function () {
			this.defaultLanguage = Localization.getLanguage();
			this.oFormat = getCurrencyInstance({
				customCurrencies : {
					BTC : {digits : 2},
					CZK : {digits : 2},
					EUR : {digits : 2, symbol : "€"},
					EU : {digits : 2},
					dem : {digits : 2},
					DEM : {digits : 2},
					DEM3 : {digits : 2},
					Dem4 : {digits : 2},
					dem4 : {digits : 2},
					IPSS : {digits : 2},
					IPß : {digits : 2},
					JPY : {digits : 2},
					USD : {digits : 2, symbol : "$"},
					BJC : {digits : 2, symbol : "$"}
				}
			});
			Localization.setLanguage("de-DE");
		},
		afterEach : function () {
			Localization.setLanguage(this.defaultLanguage);
		}
	});

	QUnit.test("Parse currencies (CLDR case)", function (assert) {
		var oFormat = getCurrencyInstance();

		assert.deepEqual(oFormat.parse("2000 euR"), [2000, "EUR"]);
		assert.deepEqual(oFormat.parse("2000 jPy"), [2000, "JPY"]);
		assert.deepEqual(oFormat.parse("inr 2000"), [2000, "INR"]);
		assert.deepEqual(oFormat.parse("UsD 2000"), [2000, "USD"]);
		assert.deepEqual(oFormat.parse("$ 2000"), [2000, "USD"]);
		assert.deepEqual(oFormat.parse("öS 2000"), [2000, "ATS"]);
		assert.deepEqual(oFormat.parse("ÖS 2000"), null, "Symbols have to be case sensitive");
	});

	QUnit.test("Parse currency symbols with custom currencies", function (assert) {
		assert.deepEqual(this.oFormat.parse("2000 €"), [2000, "EUR"]);
		assert.deepEqual(this.oFormat.parse("€ 2000"), [2000, "EUR"]);
		assert.deepEqual(this.oFormat.parse("2000 $"), [2000, undefined],
			"Duplicate symbol is not parsed");
		assert.deepEqual(this.oFormat.parse("$ 2000"), [2000, undefined],
			"Duplicate symbol is not parsed");
		assert.deepEqual(this.oFormat.parse("‡ 2000"), null, "Unknown symbol is not parsed");
	});

	QUnit.test("Parse currency codes with custom currencies", function (assert) {
		assert.deepEqual(this.oFormat.parse("2000 euR"), [2000, "EUR"]);
		assert.deepEqual(this.oFormat.parse("2000 eu"), [2000, "EU"]);
		assert.deepEqual(this.oFormat.parse("2000 EU"), [2000, "EU"]);
		assert.deepEqual(this.oFormat.parse("2000 jPy"), [2000, "JPY"]);
		assert.deepEqual(this.oFormat.parse("czk 2000"), [2000, "CZK"]);
		assert.deepEqual(this.oFormat.parse("btc 2000"), [2000, "BTC"]);
		assert.deepEqual(this.oFormat.parse("2000 XYZ"), null, "No match found");
	});

	QUnit.test("Parse exact currency code or the longest case insensitive match",
			function (assert) {
		assert.deepEqual(this.oFormat.parse("2000 dem"), [2000, "dem"]);
		assert.deepEqual(this.oFormat.parse("2000 DEM"), [2000, "DEM"]);
		assert.deepEqual(this.oFormat.parse("2000 DEM3"), [2000, "DEM3"]);
		assert.deepEqual(this.oFormat.parse("2000 dem3"), [2000, "DEM3"]);
		assert.deepEqual(this.oFormat.parse("2000 dEm"), null,
			"No clear match, 2 case insensitive matches");
		assert.deepEqual(this.oFormat.parse("2000 dEm3"), [2000, "DEM3"],
			"Duplicate was set to false");
		assert.deepEqual(this.oFormat.parse("2000 Dem4"), [2000, "Dem4"]);
		assert.deepEqual(this.oFormat.parse("2000 DEM4"), null);
	});

	QUnit.test("Parse case insensitive matches with differing lengths due to special characters",
			function (assert) {
		assert.deepEqual(this.oFormat.parse("ipß 2000"), [2000, "IPß"]);
		assert.deepEqual(this.oFormat.parse("ipss 2000"), [2000, "IPSS"]);
	});
});
