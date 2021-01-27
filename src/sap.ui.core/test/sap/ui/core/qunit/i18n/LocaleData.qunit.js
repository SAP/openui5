/*global QUnit */
sap.ui.define([
	"sap/ui/core/CalendarType",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/base/util/LoaderExtensions"
], function(CalendarType, Locale, LocaleData, LoaderExtensions) {
	"use strict";

	QUnit.module("Locale Data Loading", {
		beforeEach: function(assert) {
			this.loadResourceSpy = this.spy(LoaderExtensions, "loadResource");

		}, afterEach: function(assert) {
			this.loadResourceSpy.restore();
		}
	});

	QUnit.test("LocaleData caching of data", function(assert) {
		LocaleData.getInstance(new Locale("en_US"));
		LocaleData.getInstance(new Locale("en_US"));
		assert.equal(this.loadResourceSpy.callCount, 1, "called only once for same locale");
	});

	QUnit.test("LocaleData mapping", function(assert) {
		// sr Latin
		// sr_Latn
		LocaleData.getInstance(new Locale("sr_Latn"));
		assert.equal(this.loadResourceSpy.callCount, 1, "called for sr_Latn");
		assert.equal(this.loadResourceSpy.getCall(0).args[0], "sap/ui/core/cldr/sr_Latn.json", "sr_Latn is loaded");

		// sh maps to sr_Latn
		LocaleData.getInstance(new Locale("sh"));
		assert.equal(this.loadResourceSpy.callCount, 1, "not called for sh because sr_Latn already loaded");
		assert.equal(this.loadResourceSpy.getCall(0).args[0], "sap/ui/core/cldr/sr_Latn.json", "sr_Latn already loaded");

		// sr
		LocaleData.getInstance(new Locale("sr"));
		assert.equal(this.loadResourceSpy.callCount, 2, "called for sr");
		assert.equal(this.loadResourceSpy.getCall(1).args[0], "sap/ui/core/cldr/sr.json", "sr is loaded");
	});


	// added "sh"
	var aLanguages = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cy", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY",
		"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
		"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
		"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt",
		"lv", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sh", "sv",
		"th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"];

	aLanguages.forEach(function(sLanguage) {
		QUnit.test("getCurrentLanguageName '" + sLanguage + "'", function(assert) {
			var oLocaleData = new LocaleData(new Locale(sLanguage));
			var oLanguagesObject = oLocaleData.getLanguages();
			assert.ok(Object.keys(oLanguagesObject).length > 0, "Languages are present for locale: '" + sLanguage + "'");
			assert.ok(oLocaleData.getCurrentLanguageName(), "Current language is present for locale: '" + sLanguage + "'");
		});
	});

	QUnit.test("getCurrentLanguageName specific sh", function(assert) {
		var oLocale = new Locale("sh"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: sh");
		assert.equal(oLocaleData.getCurrentLanguageName(), "srpskohrvatski", "current language is present for locale: sh");
	});

	QUnit.test("getCurrentLanguageName specific sr-Latn", function(assert) {
		var oLocale = new Locale("sr-Latn"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: sr-Latn");
		assert.equal(oLocaleData.getCurrentLanguageName(), "srpskohrvatski", "current language is present for locale: sr-Latn");
	});

	QUnit.test("getCurrentLanguageName specific sr", function(assert) {
		var oLocale = new Locale("sr"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: sr");
		assert.equal(oLocaleData.getCurrentLanguageName(), "српски", "current language is present for locale: sr");
	});

	QUnit.test("getCurrentLanguageName specific iw", function(assert) {
		var oLocale = new Locale("iw"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: iw");
		assert.equal(oLocaleData.getCurrentLanguageName(), "עברית", "current language is present for locale: iw");
	});

	QUnit.test("getCurrentLanguageName specific he", function(assert) {
		var oLocale = new Locale("he"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: he");
		assert.equal(oLocaleData.getCurrentLanguageName(), "עברית", "current language is present for locale: he");
	});

	QUnit.test("getCurrentLanguageName specific iw-x-sapufmt", function(assert) {
		var oLocale = new Locale("iw-x-sapufmt"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: iw-x-sapufmt");
		assert.equal(oLocaleData.getCurrentLanguageName(), "עברית", "current language is present for locale: iw-x-sapufmt");
	});

	QUnit.test("getCurrentLanguageName specific he-x-sapufmt", function(assert) {
		var oLocale = new Locale("he-x-sapufmt"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: he-x-sapufmt");
		assert.equal(oLocaleData.getCurrentLanguageName(), "עברית", "current language is present for locale: he-x-sapufmt");
	});

	// neither ji nor yi is present as CLDR data
	QUnit.test("getCurrentLanguageName specific ji", function(assert) {
		var oLocale = new Locale("ji"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.deepEqual(oLanguagesObject, {}, "languages are present for locale: ji");
		assert.notOk(oLocaleData.getCurrentLanguageName(), "current language is present for locale: ji");
	});

	QUnit.test("getCurrentLanguageName specific yi", function(assert) {
		var oLocale = new Locale("yi"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.deepEqual(oLanguagesObject, {}, "languages are present for locale: yi");
		assert.notOk(oLocaleData.getCurrentLanguageName(), "current language is present for locale: yi");
	});

	QUnit.test("getCurrentLanguageName specific de-x-sapufmt", function(assert) {
		var oLocale = new Locale("de-x-sapufmt"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: de-x-sapufmt");
		assert.equal(oLocaleData.getCurrentLanguageName(), "Deutsch", "current language is present for locale: de-x-sapufmt");
	});

	QUnit.test("getCurrentLanguageName specific en-GB-x-sapufmt", function(assert) {
		var oLocale = new Locale("en-GB-x-sapufmt"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: en-GB-x-sapufmt");
		assert.equal(oLocaleData.getCurrentLanguageName(), "British English", "current language is present for locale: en-GB-x-sapufmt");
	});

	QUnit.test("getCurrentLanguageName specific zh-Hant-x-sapufmt", function(assert) {
		var oLocale = new Locale("zh-Hant-x-sapufmt"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: zh-Hant-x-sapufmt");
		assert.equal(oLocaleData.getCurrentLanguageName(), "繁體中文", "current language is present for locale: zh-Hant-x-sapufmt");
	});

	QUnit.test("getCurrentLanguageName specific sr-Latn-x-sapufmt", function(assert) {
		var oLocale = new Locale("sr-Latn-x-sapufmt"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: sr-Latn-x-sapufmt");
		assert.equal(oLocaleData.getCurrentLanguageName(), "srpskohrvatski", "current language is present for locale: sr-Latn-x-sapufmt");
	});

	QUnit.test("getCurrentLanguageName specific sr-Cyrl-x-sapufmt", function(assert) {
		var oLocale = new Locale("sr-Cyrl-x-sapufmt"),
			oLocaleData = new LocaleData(oLocale);
		var oLanguagesObject = oLocaleData.getLanguages();
		assert.ok(Object.keys(oLanguagesObject).length > 0, "languages are present for locale: sr-Cyrl-x-sapufmt");
		assert.equal(oLocaleData.getCurrentLanguageName(), "српски", "current language is present for locale: sr-Cyrl-x-sapufmt");
	});

	QUnit.module("Locale data types", {
		beforeEach: function(assert) {
			//ensure custom unit mappings and custom units are reset
			this.oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
			this.oFormatSettings.setUnitMappings();
			this.oFormatSettings.setCustomUnits();

			assert.equal(this.oFormatSettings.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(this.oFormatSettings.getUnitMappings(), undefined, "unit mappings must be undefined");
		}, afterEach: function(assert) {
			//ensure custom unit mappings and custom units are reset
			this.oFormatSettings.setUnitMappings();
			this.oFormatSettings.setCustomUnits();

			assert.equal(this.oFormatSettings.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(this.oFormatSettings.getUnitMappings(), undefined, "unit mappings must be undefined");
		}
	});


	QUnit.test("Currency digits", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("en_US"));
		assert.equal(oLocaleData.getCurrencyDigits("USD"), 2, "2 digits fuer USD");
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "2 digits fuer EUR");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "0 digits fuer JPY");
		assert.equal(oLocaleData.getCurrencyDigits("BHD"), 3, "3 digits fuer BHD");

		// CZK, CRC, SEK and NOK are explicitly tested
		// For these currencies the cash digits in the CLDR differ from the standard digits in CLDR,
		// as well as SAP's TCURX
		assert.equal(oLocaleData.getCurrencyDigits("CZK"), 2, "2 digits fuer CZK");
		assert.equal(oLocaleData.getCurrencyDigits("CRC"), 2, "2 digits fuer CRC");
		assert.equal(oLocaleData.getCurrencyDigits("SEK"), 2, "2 digits fuer SEK");
		assert.equal(oLocaleData.getCurrencyDigits("NOK"), 2, "2 digits fuer NOK");

		// HUF and TWD are explicitly set to 0 digits
		assert.equal(oLocaleData.getCurrencyDigits("HUF"), 0, "0 digits fuer HUF");
		assert.equal(oLocaleData.getCurrencyDigits("TWD"), 0, "0 digits fuer TWD");
	});

	QUnit.test("Calendar type should use the value set in configuration when getting calendar related values", function(assert) {
		sap.ui.getCore().getConfiguration().setCalendarType(CalendarType.Islamic);

		var oLocaleData = LocaleData.getInstance(new Locale("en_US"));

		assert.deepEqual(oLocaleData.getMonths("narrow"), oLocaleData.getMonths("narrow", CalendarType.Islamic), "getMonths uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDays("narrow"), oLocaleData.getDays("narrow", CalendarType.Islamic), "getDays uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getQuarters("narrow"), oLocaleData.getQuarters("narrow", CalendarType.Islamic), "getQuarters uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDayPeriods("narrow"), oLocaleData.getDayPeriods("narrow", CalendarType.Islamic), "getDayPeriods uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDatePattern("short"), oLocaleData.getDatePattern("short", CalendarType.Islamic), "getDatePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getTimePattern("short"), oLocaleData.getTimePattern("short", CalendarType.Islamic), "getTimePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDateTimePattern("short"), oLocaleData.getDateTimePattern("short", CalendarType.Islamic), "getDateTimePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getEras("narrow"), oLocaleData.getEras("narrow", CalendarType.Islamic), "getEra uses calendar type in configuration");

		sap.ui.getCore().getConfiguration().setCalendarType(null);
	});

	QUnit.test("Locale data with customization from format settings in configuration", function(assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();

		oFormatSettings.setLegacyDateFormat("3");
		var oLocaleData = LocaleData.getInstance(oFormatSettings.getFormatLocale());
		assert.equal(oLocaleData.getDatePattern("short"), "MM-dd-yyyy", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("medium"), "MM-dd-yyyy", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("short", CalendarType.Islamic), "M/d/y GGGGG", "short pattern for Islamic calendar type should be fetched from locale data");

		oFormatSettings.setLegacyTimeFormat("0");
		assert.equal(oLocaleData.getTimePattern("short"), "HH:mm", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getTimePattern("short", CalendarType.Islamic), "h:mm a", "short pattern for Islamic calendar type should be fetched from locale data");

		oFormatSettings.setLegacyDateFormat("A");
		assert.equal(oLocaleData.getDatePattern("short"), "yyyy/MM/dd", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("medium"), "yyyy/MM/dd", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("short", CalendarType.Gregorian), "M/d/yy", "short pattern for Gregorian calendar type should be fetched from locale data");
	});

	QUnit.test("Unit Display Name L10N", function(assert) {
		var oLocale = new Locale("de_DE");
		var oLocaleData = new LocaleData(oLocale);

		assert.equal(oLocaleData.getUnitDisplayName("duration-hour"), "Std.", "display name 'Std.' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("mass-gram"), "Gramm", "display name 'Gramm' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("light-lux"), "Lux", "display name 'Lux' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("length-light-year"), "Lichtjahre", "display name 'Lichtjahre' is correct");
		// unknown code
		assert.equal(oLocaleData.getUnitDisplayName("foobar"), "", "display name 'foobar' is correct");

		oLocale = new Locale("es_ES");
		oLocaleData = new LocaleData(oLocale);

		assert.equal(oLocaleData.getUnitDisplayName("duration-hour"), "horas", "display name 'horas' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("mass-gram"), "g", "display name 'g' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("light-lux"), "lx", "display name 'lx' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("length-light-year"), "a. l.", "display name 'a. l.' is correct");
	});

	QUnit.test("CustomLocaleData with getUnitFormats", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("en_US-x-sapufmt"));

		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
		oFormatSettings.setCustomUnits({
			"cats": {
				"displayName": "kittens",
				"unitPattern-count-one": "{0} kitten",
				"unitPattern-count-other": "{0} kittens"
			}
		});

		oFormatSettings.setUnitMappings({
			"CAT": "cats"
		});

		assert.equal(oLocaleData.getUnitDisplayName("cats"), "kittens");
		assert.equal(oLocaleData.getUnitDisplayName("length-meter"), "m");
		assert.equal(oLocaleData.getUnitDisplayName("CAT"), "", "not found");

		// what format does
		assert.equal(oLocaleData.getUnitFormat("cats").displayName, "kittens", "name is shown");
		assert.equal(oLocaleData.getUnitFormat("length-meter").displayName, "m", "name is shown");
		assert.notOk(oLocaleData.getUnitFormat("CAT"), "not found as it does not take mapping into consideration");
		assert.equal(oLocaleData.getUnitFromMapping("CAT"), "cats", "cats is the respective mapping");
		assert.equal(oLocaleData.getResolvedUnitFormat("CAT").displayName, "kittens", "kittens is the displayName");

		//reset unit mappings
		oFormatSettings.setUnitMappings();
	});

	QUnit.test("Unit Mappings", function(assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();

		var mUnitMappings = {
			"CAT": "cats",
			"KIT": "cats",
			"TAS": "volume-cups"
		};
		oFormatSettings.setUnitMappings(mUnitMappings);
		assert.deepEqual(oFormatSettings.getUnitMappings(), mUnitMappings, "units must be all specified");

		// set to undefined
		oFormatSettings.setUnitMappings();
		assert.deepEqual(oFormatSettings.getUnitMappings(), undefined, "units must be undefined");


		oFormatSettings.addUnitMappings(mUnitMappings);
		assert.deepEqual(oFormatSettings.getUnitMappings(), mUnitMappings, "units must be all specified");

		oFormatSettings.addUnitMappings(null);
		oFormatSettings.addUnitMappings(undefined);
		oFormatSettings.addUnitMappings();
		oFormatSettings.addUnitMappings({});

		//add should not delete mappings
		assert.deepEqual(oFormatSettings.getUnitMappings(), mUnitMappings, "units must be all specified");
		assert.equal(oFormatSettings.getUnitMappings()["CAT"], "cats", "unit mapping is initially defined");

		mUnitMappings = {
			"CAT": "volume-cups",
			"KIT": "cats",
			"RAT": "volume-rat"
		};
		oFormatSettings.addUnitMappings(mUnitMappings);
		assert.deepEqual(Object.keys(oFormatSettings.getUnitMappings()), ["CAT", "KIT", "TAS", "RAT"], "unit mappings must be all specified");
		assert.equal(oFormatSettings.getUnitMappings()["CAT"], "volume-cups", "unit mappings was overwritten");

		oFormatSettings.setUnitMappings(mUnitMappings);
		assert.deepEqual(Object.keys(oFormatSettings.getUnitMappings()), ["CAT", "KIT", "RAT"], "unit mappings must be all specified");
	});

	QUnit.test("Custom Units get/set/add", function(assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();

		var mUnits = {
			"cats": {
				"displayName": "kittens",
				"unitPattern-count-one": "{0} kitten",
				"unitPattern-count-other": "{0} kittens"
			},
			"dogs": {
				"displayName": "puppies",
				"unitPattern-count-one": "{0} puppy",
				"unitPattern-count-other": "{0} puppies"
			}
		};
		oFormatSettings.setCustomUnits(mUnits);

		assert.deepEqual(oFormatSettings.getCustomUnits(), mUnits, "units must be all specified");


		// set to undefined
		oFormatSettings.setCustomUnits();
		assert.deepEqual(oFormatSettings.getCustomUnits(), undefined, "units must be all specified");


		oFormatSettings.addCustomUnits(mUnits);
		assert.deepEqual(oFormatSettings.getCustomUnits(), mUnits, "units must be all specified");

		mUnits = {
			"cats": {
				"displayName": "kitties",
				"unitPattern-count-one": "{0} kitty",
				"unitPattern-count-other": "{0} kitties"
			},
			"dogs": {
				"displayName": "puppets",
				"unitPattern-count-one": "{0} puppy",
				"unitPattern-count-other": "{0} puppies"
			}
		};

		oFormatSettings.addCustomUnits(mUnits);
		assert.deepEqual(oFormatSettings.getCustomUnits(), mUnits, "units must be all specified");


		oFormatSettings.addCustomUnits({
			"birds": {
				"displayName": "birds",
				"unitPattern-count-one": "{0} bird",
				"unitPattern-count-other": "{0} birds"
			}
		});
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		oFormatSettings.addCustomUnits({});
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		oFormatSettings.addCustomUnits();
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		oFormatSettings.setCustomUnits(mUnits);
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs"], "units must be all specified");
	});

	var aDeprecatedLocales = [
		"sh", // -> sr
		//"ji" -> yi not present
		"iw" // -> he
	];

	QUnit.test("Deprecated locales support", function(assert) {
		aDeprecatedLocales.forEach(function(sLocale) {
			var oLocale = new Locale(sLocale),
				oLocaleData = new LocaleData(oLocale);
			//check retrieval of languages to see if the localeData was successfully loaded
			assert.ok(Object.keys(oLocaleData.getLanguages()).length > 0, "languages are present for locale: " + sLocale);
		});
	});




	QUnit.test("Currency Digits", function(assert) {

		var oLocaleData = LocaleData.getInstance(
			sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()
		);

		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "number of digits for Euro");

		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({"JPY": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 3, "number of digits for Japanese Yen");
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({"EUR": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");


		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({"EUR": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 3, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({"JPY": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 3, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 3, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");
	});

	QUnit.module("Currencies");

	QUnit.test("getCurrencySymbols", function(assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			}
		});

		var oLocaleData = LocaleData.getInstance(
			sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()
		);

		var oCurrencySymbols = oLocaleData.getCurrencySymbols();

		assert.strictEqual(oCurrencySymbols["BTC"], "Ƀ", "Custom currency symbol map contains the Bitcoin icon");
	});

	QUnit.module("Special Cases");

	QUnit.test("getLenientNumberSymbols", function(assert) {

		var oLocaleData = LocaleData.getInstance(new Locale("xx-XX"));

		var sMinusSymbols = oLocaleData.getLenientNumberSymbols("minusSign");
		var sPlusSymbols = oLocaleData.getLenientNumberSymbols("plusSign");

		assert.strictEqual(sMinusSymbols, "\x2d\u2010\u2012\u2013\u207b\u208b\u2212\u2796\ufe63", "Should match the minus symbols default");
		assert.strictEqual(sPlusSymbols, "\x2b\u207a\u208a\u2795\ufb29\ufe62", "Should match the plus symbols default");
	});
});
