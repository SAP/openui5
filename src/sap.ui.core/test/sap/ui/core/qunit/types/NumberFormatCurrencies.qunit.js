/*global QUnit */
sap.ui.define(["sap/ui/core/format/NumberFormat", "sap/ui/core/Locale", "sap/ui/core/LocaleData", "sap/base/Log"], function (NumberFormat, Locale, LocaleData, Log) {
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

	QUnit.test("Currency format with sMeasure", function (assert) {
		var oLocale = new Locale("en-US", oLocale);
		var oFormat = getCurrencyInstance({}, oLocale);
		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "JPY" + "\xa0" + "123,457", "123456.789 JPY");
		assert.equal(oFormat.format([123456.789, "JPY"]), "JPY" + "\xa0" + "123,457", "123456.789 JPY");
		assert.equal(oFormat.format(-123456.789, "JPY"), "JPY" + "\ufeff" + "-123,457", "-123456.789 JPY");
		assert.equal(oFormat.format([-123456.789, "JPY"]), "JPY" + "\ufeff" + "-123,457", "-123456.789 JPY");
	});

	QUnit.test("Currency format with sMeasure and style", function (assert) {
		var oLocale = new Locale("en-US");
		var oFormat = getCurrencyInstance({style: "long"}, oLocale);
		assert.equal(oFormat.format(123456.789, "EUR").toString(), "EUR" + "\xa0" + "123K", "123456.789 EUR");

		oFormat = getCurrencyInstance({style: "short"}, oLocale);
		assert.equal(oFormat.format(123456.789, "EUR").toString(), "EUR" + "\xa0" +  "123K", "123456.789 EUR");

		oFormat = getCurrencyInstance({style: "standard"}, oLocale);
		assert.equal(oFormat.format(123456.789, "EUR").toString(), "EUR" + "\xa0" +  "123,456.79", "123456.789 EUR");

		oFormat = getCurrencyInstance({style: "foo"}, oLocale);
		assert.equal(oFormat.format(123456.789, "EUR").toString(), "EUR" + "\xa0" +  "123,456.79", "123456.789 EUR");
	});

	QUnit.test("Currency format for locale DE", function (assert) {
		var oLocale = new Locale("de-DE");
		// currency only supports "short" style. Therefore, result should be the same for both styles.
		["long", "short"].forEach(function(sStyle) {
			var oFormat = getCurrencyInstance({ style: sStyle }, oLocale);
			// thousand format for locale "de" does not reformat the number (pattern: "100000-other": "0")
			assert.equal(oFormat.format(123456.789, "EUR").toString(), "123.456,79" + "\xa0" + "EUR");
			assert.equal(oFormat.format(-123456.789, "JPY").toString(), "-123.457" + "\xa0" + "JPY");

			// million format for locale "de" does reformat the number (pattern: "1000000-other": "0 Mio'.' ¤")
			assert.equal(oFormat.format(47123456.789, "EUR").toString(), "47" + "\xa0" + "Mio." + "\xa0" + "EUR");
			assert.equal(oFormat.format(-47123456.789, "JPY").toString(), "-47" + "\xa0" + "Mio." + "\xa0" + "JPY");
		});
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
		assert.equal(oFormat.format(undefined, undefined), "", "no values returns an empty string");
		assert.equal(oFormat.format(1234.56, undefined), "1,234.56", "only number formatted");
		assert.equal(oFormat.format(1234.5728, "FOB"), "F" + "\xa0" + "1,234.573", "formatted both");
	});

	QUnit.test("Currency format with sMeasure - unknown currency", function (assert) {
		var oFormat = getCurrencyInstance();

		//invalid unit
		assert.equal(oFormat.format(123456.789, undefined), "123,456.79", "123456.79");
		assert.equal(oFormat.format([123456.789, undefined]), "123,456.79", "123456.79");
		assert.equal(oFormat.format(-123456.789, undefined), "-123,456.79", "-123456.79");
		assert.equal(oFormat.format([-123456.789, "ASDEF"]).toString(), "ASDEF\ufeff-123,456.79", "-123456.789 ASDEF");
		assert.equal(oFormat.format([-123456.789, false]).toString(), "-123,456.79", "-123456.789 false");
		assert.equal(oFormat.format([-123456.789, NaN]).toString(), "-123,456.79", "-123456.789 NaN");
		assert.equal(oFormat.format([-123456.789, undefined]).toString(), "-123,456.79", "-123456.789 undefined");
		assert.equal(oFormat.format([-123456.789, null]).toString(), "-123,456.79", "-123456.789 null");
	});

	QUnit.test("Currency Format with fraction as decimals", function (assert) {
		var oFormat = getCurrencyInstance({minFractionDigits:6, maxFractionDigits: 6});
		assert.equal(oFormat.format(2, "EUR"), "EUR" + "\xa0" + "2.000000", "fractions should set the decimals if not specified");
	});

	QUnit.test("Currency format with sMeasure and showMeasure as symbol", function (assert) {
		var oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "€" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "€\ufeff" + "-123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "€\ufeff" + "-123,456.79", "123456.789 EUR");
	});


	QUnit.test("Currency format with custom number of decimals", function (assert) {
		var oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.equal(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.equal(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.79 BTC");

		// set custom currency digits
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({
			"EUR": { "digits": 1 },
			"JPY": { "digits": 3 },
			"CZK": { "digits": 3 },
			"BTC": { "digits": 5 }
		});

		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "€" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,456.789", "123456.789 YEN");
		assert.equal(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.789", "123456.789 CZK");
		assert.equal(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.78900", "123456.789 BTC");

		// add custom currencies
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
			"DEFAULT": { "digits": 6 }
		});
		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "€" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "MON"), "MON\xa0" + "123,456.789000", "123456.789 MON");

		// reset custom currencies
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();

		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.equal(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.equal(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.789 BTC");
	});

	QUnit.test("Currency format with sMeasure and showMeasure set to none", function (assert) {
		var oFormat = getCurrencyInstance({
			showMeasure: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "-123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "-123,456.79", "123456.789 EUR");
	});

	QUnit.module("Custom currencies - Unknown currencies", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
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

		assert.equal(sFormatted, "", "Empty string formatted.");
		assert.deepEqual(oFormat.parse(""), [NaN, undefined], "[NaN, undefined] is returned.");

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

		assert.equal(sFormatted2, "", "Empty string formatted.");
		assert.deepEqual(oFormat3.parse(""), ["", undefined], "['', undefined] is returned.");
	});

	QUnit.module("Custom currencies - simple formatting", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
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

		assert.equal(sFormatted, "BTC" + "\xa0" + "123,456.79", "Default decimals are 2");
	});

	QUnit.test("Custom Currencies defined via currency instance options", function (assert) {

		// Format $, to make sure there is no space between the symbol and the formatted number value
		var oFormat1 = getCurrencyInstance({
			currencyCode: false
		}), sFormatted1 = oFormat1.format(123456.789, "USD");

		assert.equal(sFormatted1, "$123,456.79", "$123,456.79");

		// currencyCode: true
		var oFormat = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}), sFormatted = oFormat.format(123456.789, "BTC");

		assert.equal(sFormatted, "BTC" + "\xa0" + "123,456.789", "BTC 123,456.789");
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

		assert.equal(sFormatted2, "Ƀ\xa0123,456.789", "Ƀ\xa0123,456.789");
		assert.deepEqual(oFormat.parse(sFormatted2), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		var oFormat3 = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}, new Locale("de-x-sapufmt")), sFormatted3 = oFormat3.format(123456.789, "BTC");

		assert.equal(sFormatted3, "123.456,789" + "\xa0" + "BTC", "123.456,789 BTC");
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

		assert.equal(sFormatted4, "123.456,789" + "\xa0" + "Ƀ", "123.456,789 Ƀ");
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

		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,234.572800", "formatted with 6 decimals - en");

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

		assert.equal(oFormatDE.format(1234.5728, "HOD"), "1.234,5728" + "\xa0" + "H$", "formatted with 4 decimals - de");
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

		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,234.573", "formatted with default 2 decimals - en");

		// known currency
		var oFormatDE = getCurrencyInstance({
			currencyCode: false,
			decimals: 1
		}, new Locale("de"));

		assert.equal(oFormatDE.format(1234.5728, "HUF"), "1.234,6" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
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

		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,234.57", "formatted with default 2 decimals - en");

		var oFormatDE = getCurrencyInstance({
			currencyCode: false
		}, new Locale("de"));

		assert.equal(oFormatDE.format(1234.5728, "HUF"), "1.235" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
	});

	QUnit.module("Custom currencies - currencyCode: false", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
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

		assert.equal(sFormatted, "Ƀ" + "\xa0" + "123,456.789", "'Ƀ 123,456.789' is formatted");
		assert.deepEqual(oFormat.parse(sFormatted), [123456.789, 'Bitcoin'], "[123456.789, 'Bitcoin']");
	});

	QUnit.test("Format with currency symbol with isoCode lookup", function (assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
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
		assert.equal(oFormat.format(123456.789, "Bitcoin"), "Ƀ" + "\xa0" + "123,456.789", "Ƀ 123,456.789 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// symbol lookup in CLDR
		assert.equal(oFormat.format(123456.789, "EURO"), "€123,456.79", "€123,456.79 - symbol lookup in CLDR");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "EURO")), [123456.79, "EURO"], "[123456.79, 'EURO']");

		// currency symbol is n/a in the options
		assert.equal(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies with symbol from global config", function (assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
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

		assert.equal(oFormat.format(123456.789, "BTC"), "Ƀ" + "\xa0" + "123,456.79", "Ƀ 123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.equal(oFormat.format(123456.789, "Bitcoin"), "Bitcoin" + "\xa0" + "123,456.789", "Bitcoin 123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.equal(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies from global config", function (assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
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

		assert.equal(oFormat.format(123456.789, "BTC"), "BTC" + "\xa0" + "123,456.79", "Ƀ 123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.equal(oFormat.format(123456.789, "Bitcoin"), "Bitcoin" + "\xa0" + "123,456.789", "Bitcoin 123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.equal(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.module("Custom currencies - exclusive behaviour", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Custom Currencies instance overwrites global configuration", function (assert) {
		// global configuration
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
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

		assert.equal(oFormat1.format(12345.6789, "DOLLAR"), "DOLLAR" + "\xa0" + "12,345.679", "DOLLAR 12,345.679");
		assert.deepEqual(oFormat1.parse(oFormat1.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		// Parse with symbol
		assert.deepEqual(oFormat1.parse("$12,345.679"), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		assert.equal(oFormat2.format(12345.6789, "DOLLAR"), "$12,345.679", "$12,345.679");
		assert.deepEqual(oFormat2.parse(oFormat2.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");
	});

	QUnit.module("Custom currencies - complex cases", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
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

		// these assertation also check if the longest match is found
		assert.equal(oFormatEN.format(1234.5678, "4DOL"), "4DOL" + "\xa0" + "1,234.57", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("4DOL 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("4DOL1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		// smaller match should win
		assert.equal(oFormatEN.format(1234.5678, "DO"), "DO" + "\xa0" + "1,234.5678", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO 1,234.5678"), [1234.5678, "DO"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO1,234.56789"), [1234.56789, "DO"], "parse in English locale - number at the start - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "D4OL"), "D4OL" + "\xa0" + "1,234.6", "format in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "DOL4" + "\xa0" + "1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL4 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL41,234.568"), null, "parse in English locale - number at the end - no delimiter");

		// negative values
		assert.equal(oFormatEN.format(-1234.56789, "DO"), "DO" + "\ufeff" + "-1,234.5679", "format in English locale - short match");
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
		assert.equal(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "4DOL", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 4DOL"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,574DOL"), null, "parse in German locale - number at the start - no delimiter");

		// smaller match should win
		assert.equal(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "DO", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,5678 DO"), [1234.5678, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,56789DO"), [1234.56789, "DO"], "parse in German locale - short match - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "D4OL", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "DOL4", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		// negative values
		assert.equal(oFormatDE.format(-1234.56789, "DO"), "-1.234,5679" + "\xa0" + "DO", "format in German locale - short match");
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

		assert.equal(oFormatEN.format(1234.5678, "4DOL"), "!!\xa01,234.57", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("!! 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("!!1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "D4OL"), "§\xa01,234.6", "format in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("§ 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("§1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.equal(oFormatEN.format(1234.56789, "DO"), "My#\xa01,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My# 1,234.568"), [1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My#1,234.568"), [1234.568, "DO"], "parse in English locale - short match - no delimiter");

		assert.equal(oFormatEN.format(-1234.5678, "DOL4"), "$" + "\ufeff" + "-1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ -1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$-1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.equal(oFormatEN.format(-1234.56789, "DO"), "My#" + "\ufeff" + "-1,234.5679", "format in English locale - short match");
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

		assert.equal(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "!!", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 !!"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57!!"), [1234.57, "4DOL"], "parse in German locale - number at the start - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "§", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 §"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6§"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 $"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568$"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568 My#"), [1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568My#"), [1234.568, "DO"], "parse in German locale - short match - no delimiter");

		assert.equal(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568 $"), [-1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568$"), [-1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.equal(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
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
		assert.equal(oFormatEN.format(-1234.5678, "4DOL"), "(4DOL\xa01,234.57)", "format in English locale - number at the start");
		assert.equal(oFormatEN.format(1234.5678, "4DOL"), "4DOL\xa01,234.57", "format in English locale - number at the start");

		// smaller match should win
		assert.equal(oFormatEN.format(-1234.5678, "DO"), "(DO\xa01,234.5678)", "format in English locale - number at the start");
		assert.equal(oFormatEN.format(1234.5678, "DO"), "DO\xa01,234.5678", "format in English locale - number at the start");

		assert.equal(oFormatEN.format(-1234.5678, "D4OL"), "(D4OL\xa01,234.6)", "format in English locale - number in the middle");
		assert.equal(oFormatEN.format(1234.5678, "D4OL"), "D4OL\xa01,234.6", "format in English locale - number in the middle");

		assert.equal(oFormatEN.format(-1234.5678, "DOL4"), "(DOL4\xa01,234.568)", "format in English locale - number at the end");
		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "DOL4\xa01,234.568", "format in English locale - number at the end");

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
		assert.equal(oFormatDE.format(1234.5678, "4DOL"), "1.234,57\xa04DOL", "format in German locale - number at the start");
		assert.equal(oFormatDE.format(-1234.5678, "4DOL"), "-1.234,57\xa04DOL", "format in German locale - number at the start");

		// smaller match should win
		assert.equal(oFormatDE.format(1234.5678, "DO"), "1.234,5678\xa0DO", "format in German locale - short match");
		assert.equal(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678\xa0DO", "format in German locale - short match");

		assert.equal(oFormatDE.format(1234.5678, "D4OL"), "1.234,6\xa0D4OL", "format in German locale - number in the middle");
		assert.equal(oFormatDE.format(-1234.5678, "D4OL"), "-1.234,6\xa0D4OL", "format in German locale - number in the middle");

		assert.equal(oFormatDE.format(1234.5678, "DOL4"), "1.234,568\xa0DOL4", "format in German locale - number at the end");
		assert.equal(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568\xa0DOL4", "format in German locale - number at the end");
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
		assert.equal(oFormatEN.format(1234.5678, "DOL"), "$1,234.6", "format in English locale - number at the start");
		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the start");

		// restore spy
		oLogSpy.resetHistory();
	});

	QUnit.module("Custom currencies - Ambiguous currency information", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
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

		assert.equal(oFormat.format(12345.6789, "MON"), "MON" + "\xa0" + "12,345.68", "MON 12,345.68");
		assert.equal(oFormat.format(12345.6789, "MONERO"), "MONERO" + "\xa0" + "12,345.67890", "MONERO 12,345.6789");
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

		assert.equal(oFormat2.format(12345.6789, "EUR5"), "€12,345.67890", "€12,345.68");
		assert.equal(oFormat2.format(12345.6789, "EU"), "€12,345.68", "€12,345.6789");
		assert.deepEqual(oFormat2.parse("€12,345.679"), [12345.679, undefined], "[12345.679, undefined] returned.");
	});

	QUnit.test("Duplicated symbol defined via custom currency", function(assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({
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

		assert.equal(oFormat.format(123, "Bitcoin"), "Bitcoin 123.000");

		assert.equal(oSpy.callCount, 0, "Error log for duplicated currencies was was not called");

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
		assert.equal(oFormatEN.format(undefined, undefined), "", "no values returns an empty string - en");
		assert.equal(oFormatEN.format(1234.56, undefined), "1,234.56", "only number formatted - en");
		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,235", "formatted both - en");

		var oFormatDE = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"HOD": {
					symbol: "H$",
					decimals: 0
				}
			}
		}, new Locale("de"));
		assert.equal(oFormatDE.format(undefined, undefined), "", "no values returns an empty string - de");
		assert.equal(oFormatDE.format(1234.56, undefined), "1.234,56", "only number formatted - de");
		assert.equal(oFormatDE.format(1234.5728, "HOD"), "1.235" + "\xa0" + "H$", "formatted both - de");
	});

	QUnit.module("Custom currencies - parseAsString: true", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
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
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Currency format with showMeasure true and currencyContext accounting", function (assert) {
		var oFormat = getCurrencyInstance({
			showMeasure: true,
			currencyContext: "accounting"
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "(EUR" + "\xa0" + "123,456.79)", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "(EUR" + "\xa0" + "123,456.79)", "123456.789 EUR");
	});

	QUnit.test("Currency format with showMeasure false and currencyContext accounting", function (assert) {
		var oFormat = getCurrencyInstance({
			showMeasure: false,
			currencyContext: "accounting"
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "(123,456.79)", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "(123,456.79)", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeasure specific locale ko", function (assert) {
		// The currency pattern is definde in "ko" as: ¤#,##0.00;(¤#,##0.00) where the pattern after ';'
		// should be used for negative numbers.
		var oLocale = new Locale("ko");
		var oFormat = getCurrencyInstance({
			currencyContext: "accounting"
		}, oLocale);

		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "(EUR" + "\xa0" + "123,456.79)", "-123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "(EUR" + "\xa0" + "123,456.79)", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and set decimal option to overwrite the default number of decimal", function (assert) {
		var oFormat = getCurrencyInstance({
			decimals: 1
		});

		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.8", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and the precision option should be ignored", function (assert) {
		var oFormat = getCurrencyInstance({
			precision: 7
		});

		assert.equal(oFormat.format(123456, "EUR"), "EUR" + "\xa0" + "123,456.00", "123456 EUR");
		assert.equal(oFormat.format([123456.7, "EUR"]), "EUR" + "\xa0" + "123,456.70", "123456.7 EUR");
		assert.equal(oFormat.format(-123456.78, "EUR"), "EUR" + "\ufeff" + "-123,456.78", "-123456.78 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and style short. The default precision option shouldn't be ignored", function (assert) {
		var oFormat = getCurrencyInstance({
			style: "short"
		});

		assert.equal(oFormat.format(123456, "EUR"), "EUR" + "\xa0" + "123K", "123456 EUR");
		assert.equal(oFormat.format([1234567.8, "EUR"]), "EUR" + "\xa0" + "1.2M", "123456.7 EUR");
		assert.equal(oFormat.format(12345678.9, "EUR"), "EUR" + "\xa0" + "12M", "-123456.78 EUR");
	});

	QUnit.test("check space between currency code and number in different scenarios", function (assert) {
		// in "en-US" locale there's no space in the currency pattern
		// space should be inserted when it's necessary
		var oCurrencyCodeFormatter = getCurrencyInstance(),
			oCurrencySymbolFormatter = getCurrencyInstance({
				currencyCode: false
			});

		assert.equal(oCurrencyCodeFormatter.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "€\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "HKD"), "HK$123,456.79", "123456.789 HKD");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "HK$\ufeff-123,456.79", "-123456.789 HKD");

		// in "de-DE" locale there's already space in the currency pattern: #,##0.00 ¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = getCurrencyInstance(new Locale("de-DE"));
		oCurrencySymbolFormatter = getCurrencyInstance({
			currencyCode: false
		}, new Locale("de-DE"));

		assert.equal(oCurrencyCodeFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.equal(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "EUR", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "€", "123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "€", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "HKD"), "123.456,79" + "\xa0" + "HK$", "123456.789 HKD");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "-123.456,79" + "\xa0" + "HK$", "-123456.789 HKD");

		// in "uk" locale there's no space in the currency pattern and the symbol is at the end: #,##0.00¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = getCurrencyInstance({
			currencyContext: "accounting"
		}, new Locale("uk"));
		oCurrencySymbolFormatter = getCurrencyInstance({
			currencyCode: false,
			currencyContext: "accounting"
		}, new Locale("uk"));

		assert.equal(oCurrencyCodeFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0" + "UAH", "123456.789 UAH");
		assert.equal(oCurrencyCodeFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0" + "UAH", "-123456.789 UAH");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0\u20b4", "123456.789 UAH");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0\u20b4", "-123456.789 UAH");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "UAK"), "123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "123456.789 UAK");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "UAK"), "-123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "-123456.789 UAK");
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




	QUnit.test("parse currency format", function (assert) {
		var oFormat = getCurrencyInstance();
		var aResult = oFormat.parse("EUR -12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12345.67, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12,345.67 EURO");
		assert.strictEqual(aResult, null, "Currency parser should return null");

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12345.67, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("USD23.4567");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23.4567, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -1234567.89, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR");
		assert.equal(aResult, null, "String with currency code only can't be parsed");

		aResult = oFormat.parse("1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], undefined, "Currency Code is parsed correctly: expected, parsed " + aResult[1]);

		aResult = oFormat.parse("€" + " 1,234,567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("$ 1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		oFormat = getCurrencyInstance({
			showMeasure: false
		});

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.equal(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("USD23.4567");
		assert.equal(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("EUR-1234567.89");
		assert.equal(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("EUR");
		assert.equal(aResult, null, "String with currency code only can't be parsed");

		aResult = oFormat.parse("1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], undefined, "Currency Code is parsed correctly: expected, parsed " + aResult[1]);

		oFormat = getCurrencyInstance({
			parseAsString: true
		});

		aResult = oFormat.parse("EUR-12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-00012,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345678901123456.78", "Long number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345678901123456345678901123456.78", "Ridiculously long number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		oFormat = getCurrencyInstance({}, new Locale("de"));
		aResult = oFormat.parse("-12.345,67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12345.67, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("23,4567 USD");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23.4567, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("23,4567 $");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23.4567, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("-1234567,89EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -1234567.89, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

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
		assert.equal(aResult[0], 5, "Number is parsed correctly");
		assert.equal(aResult[1], "GBP", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("SEK 6");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 6, "Number is parsed correctly");
		assert.equal(aResult[1], "SEK", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("12 EUR K");
		assert.equal(aResult, null, "Currency between number and scale cannot be parsed");

		aResult = oFormat.parse("EUR-12K");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12K EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("USD23M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23000000, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR -12 million");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12000000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 0.00T");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 0, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 0.2M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 200000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);
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
		assert.equal(sFormatted.toString(), "‏50,000.00‎", "can be formatted '" + sFormatted + "' (contains RTL character)");

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

		assert.equal(oFormat.format(100000, "INR"), "INR\xa01,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(10000000, "INR"), "INR\xa01,00,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(10000000000, "INR"), "INR\xa01,000,00,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(1000000000000, "INR"), "INR\xa01,00,000,00,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(100000000000000, "INR"), "INR\xa01,00,00,000,00,00,000.00", "INR is formatted with correct grouping");

		oFormat = getCurrencyInstance({ style: "short" }, oLocale);

		assert.equal(oFormat.format(100000, "INR"), "INR\xa01 Lk", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(10000000, "INR"), "INR\xa01 Cr", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(10000000000, "INR"), "INR\xa01,000 Cr", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(1000000000000, "INR"), "INR\xa01 Lk Cr", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(100000000000000, "INR"), "INR\xa01 Cr Cr", "INR is formatted as Lk/Cr");

		assert.equal(oFormat.format(100000, "USD"), "USD\xa0100K", "USD is formatted as M/B/T");
		assert.equal(oFormat.format(1000000, "USD"), "USD\xa01M", "USD is formatted as M/B/T");
		assert.equal(oFormat.format(1000000000, "USD"), "USD\xa01B", "USD is formatted as M/B/T");

		var aResult = oFormat.parse("INR 12 Lk");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1200000, "Number is parsed correctly");
		assert.equal(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("12 Lk INR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1200000, "Number is parsed correctly");
		assert.equal(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("INR 12 Cr");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 120000000, "Number is parsed correctly");
		assert.equal(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 12M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 12000000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);
	});

	QUnit.test("getScale", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = getCurrencyInstance({style: "short", shortRefNumber: 1234}, oLocale);
		assert.equal(oFormat.getScale(), "\u00a4K", "scale is correctly retrieved");

		oFormat = getCurrencyInstance({style: "short"}, oLocale);
		assert.equal(oFormat.getScale(), undefined, "scale not retrieved");

		oFormat = getCurrencyInstance({}, oLocale);
		assert.equal(oFormat.getScale(), undefined, "scale not retrieved");

	});

	QUnit.test("Currency instantiation without format options", function (assert) {
		assert.ok(NumberFormat.getCurrencyInstance(), "instantiation without options should succeed");
	});

});
