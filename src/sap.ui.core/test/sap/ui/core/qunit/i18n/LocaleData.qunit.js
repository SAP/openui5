/*global QUnit*/
sap.ui.define([
	"./helper/_timezones",
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/i18n/date/TimezoneUtils",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Configuration",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/CalendarWeekNumbering"
], function(timezones, Log, Formatting, Localization, TimezoneUtils, LoaderExtensions, CalendarType, Configuration, Lib,
		Locale, LocaleData, CalendarWeekNumbering) {
	"use strict";
	const aSupportedLanguages = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cnr", "cs", "cy", "da", "de", "de_AT", "de_CH",
		"el", "el_CY", "en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
		"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr", "fr_BE",
		"fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt", "lv", "mk",
		"ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv", "th",
		"tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"];

	QUnit.module("Locale Data Loading", {
		beforeEach: function(assert) {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			this.loadResourceSpy = this.spy(LoaderExtensions, "loadResource");
		}, afterEach: function(assert) {
			this.loadResourceSpy.restore();
		}
	});

	//*********************************************************************************************
	QUnit.test("Supported languages", function(assert) {
		assert.deepEqual(LocaleData._cldrLocales.slice().sort(), aSupportedLanguages.slice().sort());
	});

	QUnit.test("LocaleData caching of data", function(assert) {
		LocaleData.getInstance(new Locale("en_US"));
		// Get Instance again to test cache
		LocaleData.getInstance(new Locale("en_US"));
		assert.equal(this.loadResourceSpy.callCount, 1, "called only once for same locale");
	});

	QUnit.test("LocaleData mapping", function(assert) {
		// Serbian Latin
		// sr_Latn -> sr-Latn
		var oLocaleData = LocaleData.getInstance(new Locale("sr_Latn"));
		assert.equal(this.loadResourceSpy.callCount, 1, "called for sr_Latn");
		assert.equal(this.loadResourceSpy.getCall(0).args[0], "sap/ui/core/cldr/sr_Latn.json", "sr_Latn is loaded");
		assert.equal(oLocaleData.sCLDRLocaleId, "sr-Latn");

		// sh -> sr-Latn
		oLocaleData = LocaleData.getInstance(new Locale("sh"));
		assert.equal(this.loadResourceSpy.callCount, 1, "not called for sh because sr_Latn already loaded");
		assert.equal(this.loadResourceSpy.getCall(0).args[0], "sap/ui/core/cldr/sr_Latn.json", "sr_Latn already loaded");
		assert.equal(oLocaleData.sCLDRLocaleId, "sr-Latn");

		// sr -> sr
		oLocaleData = LocaleData.getInstance(new Locale("sr"));
		assert.equal(this.loadResourceSpy.callCount, 2, "called for sr");
		assert.equal(this.loadResourceSpy.getCall(1).args[0], "sap/ui/core/cldr/sr.json", "sr is loaded");
		assert.equal(oLocaleData.sCLDRLocaleId, "sr");

		// zh_Hant -> zh-TW
		oLocaleData = LocaleData.getInstance(new Locale("zh_Hant"));
		assert.equal(oLocaleData.sCLDRLocaleId, "zh-TW");

		// zh_Hans -> zh-CN
		oLocaleData = LocaleData.getInstance(new Locale("zh_Hans"));
		assert.equal(oLocaleData.sCLDRLocaleId, "zh-CN");

		// no -> nb
		oLocaleData = LocaleData.getInstance(new Locale("no"));
		assert.equal(oLocaleData.sCLDRLocaleId, "nb");

		// de_CH (with region) -> de-CH
		oLocaleData = LocaleData.getInstance(new Locale("de_CH"));
		assert.equal(oLocaleData.sCLDRLocaleId, "de-CH");

		// de (without region) -> de
		oLocaleData = LocaleData.getInstance(new Locale("de"));
		assert.equal(oLocaleData.sCLDRLocaleId, "de");

		// invalid (falls back to en) -> en
		oLocaleData = LocaleData.getInstance(new Locale("invalid"));
		assert.equal(oLocaleData.sCLDRLocaleId, "en");
	});

	aSupportedLanguages.forEach(function(sLanguage) {
		QUnit.test("getCurrentLanguageName '" + sLanguage + "'", function(assert) {
			var oLocaleData = LocaleData.getInstance(new Locale(sLanguage));
			var oLanguagesObject = oLocaleData.getLanguages();
			assert.ok(Object.keys(oLanguagesObject).length > 0, "Languages are present for locale: '" + sLanguage + "'");
			assert.ok(oLocaleData.getCurrentLanguageName(), "Current language is present for locale: '" + sLanguage + "'");
		});
	});
[
	{sLocale: "cnr", sName: "crnogorski"},
	{sLocale: "cnr_ME", sName: "crnogorski (Crna Gora)"},
	{sLocale: "he", sName: "עברית"},
	{sLocale: "iw", sName: "עברית"},
	{sLocale: "mk", sName: "македонски"},
	{sLocale: "mk_MK", sName: "македонски (Северна Македонија)"},
	{sLocale: "sh", sName: "srpskohrvatski"},
	{sLocale: "sr-Latn", sName: "srpskohrvatski"},
	{sLocale: "sr_Latn_RS", sName: "srpskohrvatski (Srbija)"},
	{sLocale: "sr", sName: "српски"},
	{sLocale: "sr_RS", sName: "српски (Србија)"},
	{sLocale: "sr_Cyrl", sName: "српски (ћирилица)"},
	{sLocale: "sr_Cyrl_RS", sName: "српски (ћирилица)"},
	{sLocale: "de-x-sapufmt", sName: "Deutsch"},
	{sLocale: "en-GB-x-sapufmt", sName: "British English"},
	{sLocale: "he-x-sapufmt", sName: "עברית"},
	{sLocale: "iw-x-sapufmt", sName: "עברית"},
	{sLocale: "sr-Cyrl-x-sapufmt", sName: "српски (ћирилица)"},
	{sLocale: "sr-Latn-x-sapufmt", sName: "srpskohrvatski"},
	{sLocale: "zh-Hant-x-sapufmt", sName: "繁體中文"},
	// neither ji nor yi is present as CLDR data (en.json is used then)
	{sLocale: "ji", sName: "Yiddish"},
	{sLocale: "yi", sName: "Yiddish"}
].forEach((oFixture) => {
	QUnit.test("getCurrentLanguageName specific " + oFixture.sLocale, function(assert) {
		const oLocaleData = LocaleData.getInstance(new Locale(oFixture.sLocale));
		assert.ok(Object.keys(oLocaleData.getLanguages()).length > 0, "languages are present");
		assert.equal(oLocaleData.getCurrentLanguageName(), oFixture.sName, "current language is present");
	});
});

	QUnit.test("getCurrentLanguageName: calls getLanguageName", function(assert) {
		const oLocaleData = {
			oLocale: {
				toString() {
					return "~Locale#toString()";
				}
			},
			getLanguageName() {}
		};
		this.mock(oLocaleData).expects("getLanguageName").withExactArgs("~Locale#toString()").returns("~name");

		// code under test
		assert.strictEqual(LocaleData.prototype.getCurrentLanguageName.call(oLocaleData), "~name");
	});

	QUnit.module("Locale data types", {
		beforeEach: function(assert) {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			//ensure custom unit mappings and custom units are reset
			Formatting.setUnitMappings();
			Formatting.setCustomUnits();

			assert.equal(Formatting.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(Formatting.getUnitMappings(), undefined, "unit mappings must be undefined");
		}, afterEach: function(assert) {
			//ensure custom unit mappings and custom units are reset
			Formatting.setUnitMappings();
			Formatting.setCustomUnits();

			assert.equal(Formatting.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(Formatting.getUnitMappings(), undefined, "unit mappings must be undefined");
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
		Formatting.setCalendarType(CalendarType.Islamic);

		var oLocaleData = LocaleData.getInstance(new Locale("en_US"));

		assert.deepEqual(oLocaleData.getMonths("narrow"), oLocaleData.getMonths("narrow", CalendarType.Islamic), "getMonths uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDays("narrow"), oLocaleData.getDays("narrow", CalendarType.Islamic), "getDays uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getQuarters("narrow"), oLocaleData.getQuarters("narrow", CalendarType.Islamic), "getQuarters uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDayPeriods("narrow"), oLocaleData.getDayPeriods("narrow", CalendarType.Islamic), "getDayPeriods uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDatePattern("short"), oLocaleData.getDatePattern("short", CalendarType.Islamic), "getDatePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getTimePattern("short"), oLocaleData.getTimePattern("short", CalendarType.Islamic), "getTimePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDateTimePattern("short"), oLocaleData.getDateTimePattern("short", CalendarType.Islamic), "getDateTimePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getEras("narrow"), oLocaleData.getEras("narrow", CalendarType.Islamic), "getEra uses calendar type in configuration");

		Formatting.setCalendarType(null);
	});

	QUnit.test("Locale data with customization from format settings in configuration", function(assert) {
		Formatting.setABAPDateFormat("3");
		var oLocaleData = LocaleData.getInstance(new Locale(Formatting.getLanguageTag()));
		assert.equal(oLocaleData.getDatePattern("short"), "MM-dd-yyyy", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("medium"), "MM-dd-yyyy", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("short", CalendarType.Islamic), "M/d/y GGGGG", "short pattern for Islamic calendar type should be fetched from locale data");

		Formatting.setABAPTimeFormat("0");
		assert.equal(oLocaleData.getTimePattern("short"), "HH:mm", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getTimePattern("short", CalendarType.Islamic), "h:mm\u202fa",
			"short pattern for Islamic calendar type should be fetched from locale data");

		Formatting.setABAPDateFormat("A");
		assert.equal(oLocaleData.getDatePattern("short"), "yyyy/MM/dd", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("medium"), "yyyy/MM/dd", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("short", CalendarType.Gregorian), "M/d/yy", "short pattern for Gregorian calendar type should be fetched from locale data");
	});

	//*********************************************************************************************
["abbreviated", "narrow", "wide"].forEach(function (sFormatType) {
	[true, false].forEach(function (bStandAlone) {
	var sMethod = bStandAlone ? "getFlexibleDayPeriodsStandAlone" : "getFlexibleDayPeriods",
		sTitle = sMethod + ": " + sFormatType;

	QUnit.test(sTitle, function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de_DE")),
			sParseType =  bStandAlone ? "stand-alone" : "format";

		this.mock(oLocaleData).expects("_get")
			.withExactArgs("ca-gregorian", "flexibleDayPeriods", sParseType, sFormatType)
			.returns("~flexibleDayPeriods");

		assert.strictEqual(oLocaleData[sMethod](sFormatType, "Gregorian"), "~flexibleDayPeriods");
	});
	});
});

	//*********************************************************************************************
[
	{sCalenderType : CalendarType.Gregorian, sCLDRCalenderType : "ca-gregorian"},
	{sCalenderType : CalendarType.Islamic, sCLDRCalenderType : "ca-islamic"},
	{sCalenderType : CalendarType.Japanese, sCLDRCalenderType : "ca-japanese"},
	{sCalenderType : CalendarType.Persian, sCLDRCalenderType : "ca-persian"},
	{sCalenderType : CalendarType.Buddhist, sCLDRCalenderType : "ca-buddhist"}
].forEach(function (oFixture) {
	[true, false].forEach(function (bStandAlone) {
	var sMethod = bStandAlone ? "getFlexibleDayPeriodsStandAlone" : "getFlexibleDayPeriods",
		sTitle = sMethod + ": " + oFixture.sCLDRCalenderType;

	QUnit.test(sTitle, function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de_DE")),
			sParseType =  bStandAlone ? "stand-alone" : "format";

		this.mock(oLocaleData).expects("_get")
			.withExactArgs(oFixture.sCLDRCalenderType, "flexibleDayPeriods", sParseType, "wide")
			.returns("~flexibleDayPeriods");

		assert.strictEqual(oLocaleData[sMethod]("wide", oFixture.sCalenderType),
			"~flexibleDayPeriods");
	});
	});
});

	//*********************************************************************************************
	QUnit.test("getFlexibleDayPeriods; integrative test", function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de_DE"));

		assert.deepEqual(oLocaleData.getFlexibleDayPeriods("foo", "Gregorian"), undefined);
		assert.deepEqual(oLocaleData.getFlexibleDayPeriods("abbreviated", "foo"), undefined);

		assert.deepEqual(oLocaleData.getFlexibleDayPeriods("abbreviated", "Gregorian"), {
			"afternoon1" : "mittags",
			"afternoon2" : "nachm.",
			"evening1" : "abends",
			"midnight" : "Mitternacht",
			"morning1" : "morgens",
			"morning2" : "vorm.",
			"night1" : "nachts"
		});
	});

	//*********************************************************************************************
	QUnit.test("getFlexibleDayPeriodsStandAlone; integrative test", function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de_DE"));

		assert.deepEqual(oLocaleData.getFlexibleDayPeriodsStandAlone("foo", "Gregorian"),
			undefined);
		assert.deepEqual(oLocaleData.getFlexibleDayPeriodsStandAlone("wide", "foo"),
			undefined);

		assert.deepEqual(oLocaleData.getFlexibleDayPeriodsStandAlone("wide", "Gregorian"), {
			"afternoon1" : "Mittag",
			"afternoon2" : "Nachmittag",
			"evening1" : "Abend",
			"midnight" : "Mitternacht",
			"morning1" : "Morgen",
			"morning2" : "Vormittag",
			"night1" : "Nacht"
		});
	});

	//*********************************************************************************************
[
	{iHour : 5, iMinute : 59, sResult : "night"},
	{iHour : 6, iMinute : 0, sResult : "morning1"},
	{iHour : 6, iMinute : 1, sResult : "morning1"},
	{iHour : 21, iMinute : 59, sResult : "evening"},
	{iHour : 22, iMinute : 0, sResult : "night"},
	{iHour : 11, iMinute : 59, sResult : "morning1"},
	{iHour : 36, iMinute : 40, sResult : "morning2"},
	{iHour : 12, iMinute : 0, sResult : "noon"},
	{iHour : 11, iMinute : 60, sResult : "noon"},
	{iHour : 36, iMinute : 0, sResult : "noon"},
	{iHour : 24, iMinute : 0, sResult : "midnight"},
	{iHour : 23, iMinute : 60, sResult : "midnight"},
	{iHour : 23, iMinute : 61, sResult : "night"},
	{iHour : 23, iMinute : 59, sResult : "night"},
	{iHour : 24, iMinute : 1, sResult : "night"},
	{iHour : 99, iMinute : 100, sResult : "night"}
].forEach(function (oFixture) {
	var sTitle = "getFlexibleDayPeriodOfTime testing period edges for time " + oFixture.iHour + ":"
		+ oFixture.iMinute;

	QUnit.test(sTitle, function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de_DE"));

		this.mock(oLocaleData).expects("_get")
			.withExactArgs("dayPeriodRules")
			.returns({
				evening : {_before : "22:00", _from : "18:00"},
				midnight : {_at : "00:00"},
				morning1 : {_before : "12:00", _from : "06:00"},
				morning2 : {_before : "18:00", _from : "12:00"},
				night : {_before : "06:00", _from : "22:00"},
				noon : {_at : "12:00"}
			});

		assert.strictEqual(oLocaleData.getFlexibleDayPeriodOfTime(oFixture.iHour, oFixture.iMinute),
			oFixture.sResult);
	});
});

	//*********************************************************************************************
	QUnit.test("Unit Display Name L10N", function(assert) {
		var oLocale = new Locale("de_DE");
		var oLocaleData = LocaleData.getInstance(oLocale);

		assert.equal(oLocaleData.getUnitDisplayName("duration-hour"), "Std.", "display name 'Std.' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("mass-gram"), "Gramm", "display name 'Gramm' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("light-lux"), "Lux", "display name 'Lux' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("length-light-year"), "Lj", "display name 'Lj' is correct");
		// unknown code
		assert.equal(oLocaleData.getUnitDisplayName("foobar"), "", "display name 'foobar' is correct");

		oLocale = new Locale("es_ES");
		oLocaleData = LocaleData.getInstance(oLocale);

		assert.equal(oLocaleData.getUnitDisplayName("duration-hour"), "horas", "display name 'horas' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("mass-gram"), "g", "display name 'g' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("light-lux"), "lx", "display name 'lx' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("length-light-year"), "a. l.", "display name 'a. l.' is correct");
	});

	//*********************************************************************************************
[
	{sUnit: "acceleration-meter-per-square-second", oReturn: "m/s²"},
	{sUnit: "fooBar", oReturn: undefined}
].forEach(function (oFixture, i) {
	QUnit.test("getUnitFormat without legacy unit mapping " + i, function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("en"));

		this.mock(oLocaleData).expects("_get")
			.withExactArgs("units", "short", oFixture.sUnit)
			.returns(oFixture.oReturn);

		assert.strictEqual(oLocaleData.getUnitFormat(oFixture.sUnit), oFixture.oReturn);
	});
});

	//*********************************************************************************************
	QUnit.test("getUnitFormat with legacy unit mapping", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("en")),
			oLocaleDataMock = this.mock(oLocaleData);

		oLocaleDataMock.expects("_get")
			.withExactArgs("units", "short", "acceleration-meter-per-second-squared")
			.returns(undefined);
		oLocaleDataMock.expects("_get")
			.withExactArgs("units", "short", "acceleration-meter-per-square-second")
			.returns("~unitFormat");

		assert.strictEqual(oLocaleData.getUnitFormat("acceleration-meter-per-second-squared"), "~unitFormat");
	});

	//*********************************************************************************************
	QUnit.test("getUnitFormat legacy unit found without mapping", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("en"));

		this.mock(oLocaleData).expects("_get")
			.withExactArgs("units", "short", "acceleration-meter-per-second-squared")
			.returns("~unitFormat");

		assert.strictEqual(oLocaleData.getUnitFormat("acceleration-meter-per-second-squared"), "~unitFormat");
	});

	QUnit.test("CustomLocaleData with getUnitFormats", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("en_US-x-sapufmt"));

		Formatting.setCustomUnits({
			"cats": {
				"displayName": "kittens",
				"unitPattern-count-one": "{0} kitten",
				"unitPattern-count-other": "{0} kittens"
			},
			"acceleration-meter-per-second-squared": {
				"displayName": "fooBar",
				"unitPattern-count-other": "{0} bar"
			}
		});

		Formatting.setUnitMappings({
			"CAT": "cats",
			"fooBar": "acceleration-meter-per-second-squared"
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
		assert.strictEqual(oLocaleData.getUnitFromMapping("fooBar"), "acceleration-meter-per-second-squared",
			"Mapped legacy unit to custom unit returns custom unit");
		assert.strictEqual(oLocaleData.getUnitFormat("acceleration-meter-per-second-squared").displayName, "fooBar",
			"Custom legacy unit returns custom unit");
		assert.strictEqual(oLocaleData.getUnitFromMapping("concentr-milligram-per-deciliter"), undefined,
			"Legacy unit is not found in custom unit mapping");
		assert.strictEqual(oLocaleData.getUnitFormat("concentr-milligram-per-deciliter").displayName, "mg/dL",
			"Legacy unit is mapped to new unit in CLDR");

		//reset unit mappings
		Formatting.setUnitMappings();
	});

	QUnit.test("Unit Mappings", function(assert) {
		var mUnitMappings = {
			"CAT": "cats",
			"KIT": "cats",
			"TAS": "volume-cups"
		};
		Formatting.setUnitMappings(mUnitMappings);
		assert.deepEqual(Formatting.getUnitMappings(), mUnitMappings, "units must be all specified");

		// set to undefined
		Formatting.setUnitMappings();
		assert.deepEqual(Formatting.getUnitMappings(), undefined, "units must be undefined");


		Formatting.addUnitMappings(mUnitMappings);
		assert.deepEqual(Formatting.getUnitMappings(), mUnitMappings, "units must be all specified");

		Formatting.addUnitMappings(null);
		Formatting.addUnitMappings(undefined);
		Formatting.addUnitMappings();
		Formatting.addUnitMappings({});

		//add should not delete mappings
		assert.deepEqual(Formatting.getUnitMappings(), mUnitMappings, "units must be all specified");
		assert.equal(Formatting.getUnitMappings()["CAT"], "cats", "unit mapping is initially defined");

		mUnitMappings = {
			"CAT": "volume-cups",
			"KIT": "cats",
			"RAT": "volume-rat"
		};
		Formatting.addUnitMappings(mUnitMappings);
		assert.deepEqual(Object.keys(Formatting.getUnitMappings()), ["CAT", "KIT", "TAS", "RAT"], "unit mappings must be all specified");
		assert.equal(Formatting.getUnitMappings()["CAT"], "volume-cups", "unit mappings was overwritten");

		Formatting.setUnitMappings(mUnitMappings);
		assert.deepEqual(Object.keys(Formatting.getUnitMappings()), ["CAT", "KIT", "RAT"], "unit mappings must be all specified");
	});

	QUnit.test("Custom Units get/set/add", function(assert) {
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
		Formatting.setCustomUnits(mUnits);

		assert.deepEqual(Formatting.getCustomUnits(), mUnits, "units must be all specified");


		// set to undefined
		Formatting.setCustomUnits();
		assert.deepEqual(Formatting.getCustomUnits(), undefined, "units must be all specified");


		Formatting.addCustomUnits(mUnits);
		assert.deepEqual(Formatting.getCustomUnits(), mUnits, "units must be all specified");

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

		Formatting.addCustomUnits(mUnits);
		assert.deepEqual(Formatting.getCustomUnits(), mUnits, "units must be all specified");


		Formatting.addCustomUnits({
			"birds": {
				"displayName": "birds",
				"unitPattern-count-one": "{0} bird",
				"unitPattern-count-other": "{0} birds"
			}
		});
		assert.deepEqual(Object.keys(Formatting.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		Formatting.addCustomUnits({});
		assert.deepEqual(Object.keys(Formatting.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		Formatting.addCustomUnits();
		assert.deepEqual(Object.keys(Formatting.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		Formatting.setCustomUnits(mUnits);
		assert.deepEqual(Object.keys(Formatting.getCustomUnits()), ["cats", "dogs"], "units must be all specified");
	});

	var aDeprecatedLocales = [
		"sh", // -> sr
		//"ji" -> yi not present
		"iw" // -> he
	];

	QUnit.test("Deprecated locales support", function(assert) {
		aDeprecatedLocales.forEach(function(sLocale) {
			var oLocale = new Locale(sLocale),
				oLocaleData = LocaleData.getInstance(oLocale);
			//check retrieval of languages to see if the localeData was successfully loaded
			assert.ok(Object.keys(oLocaleData.getLanguages()).length > 0, "languages are present for locale: " + sLocale);
		});
	});

	QUnit.test("Currency Digits", function(assert) {

		var oLocaleData = LocaleData.getInstance(
			Formatting.getLanguageTag()
		);

		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "number of digits for Euro");

		Formatting.setCustomCurrencies({"JPY": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 3, "number of digits for Japanese Yen");
		Formatting.setCustomCurrencies({"EUR": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		Formatting.setCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");


		Formatting.addCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		Formatting.addCustomCurrencies({"EUR": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 3, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		Formatting.addCustomCurrencies({"JPY": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 3, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 3, "number of digits for Japanese Yen");

		Formatting.setCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");
	});

	QUnit.module("sap.ui.core.LocaleData", {
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			LocaleData._mTimezoneTranslations = {};
		},
		after: function () {
			// Make sure that the translation cache is deleted to reduce the memory consumption after the test
			LocaleData._mTimezoneTranslations = {};
		}
	});

	QUnit.test("getCurrencySymbols", function(assert) {
		Formatting.addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			}
		});

		var oLocaleData = LocaleData.getInstance(
			new Locale(Formatting.getLanguageTag())
		);

		var oCurrencySymbols = oLocaleData.getCurrencySymbols();

		assert.strictEqual(oCurrencySymbols["BTC"], "Ƀ", "Custom currency symbol map contains the Bitcoin icon");
	});

	// ABAP timezone IDs not supported by CLDR (yet).
	var aABAPUnsupportedIDs = [
		"Etc/GMT",
		"Etc/GMT0",
		"Etc/GMT+0",
		"Etc/GMT+1",
		"Etc/GMT+2",
		"Etc/GMT+3",
		"Etc/GMT+4",
		"Etc/GMT+5",
		"Etc/GMT+6",
		"Etc/GMT+7",
		"Etc/GMT+8",
		"Etc/GMT+9",
		"Etc/GMT+10",
		"Etc/GMT+11",
		"Etc/GMT+12",
		"Etc/GMT-0",
		"Etc/GMT-1",
		"Etc/GMT-2",
		"Etc/GMT-3",
		"Etc/GMT-4",
		"Etc/GMT-5",
		"Etc/GMT-6",
		"Etc/GMT-7",
		"Etc/GMT-8",
		"Etc/GMT-9",
		"Etc/GMT-10",
		"Etc/GMT-11",
		"Etc/GMT-12",
		"Etc/GMT-13",
		"Etc/GMT-14",
		"Etc/Greenwich",
		"Etc/Zulu"
	];

	aSupportedLanguages.forEach(function (sLocale) {
		QUnit.test("getTimezoneTranslations for " + sLocale + " and ensure bijective mapping", function(assert) {
			var oLocaleData = LocaleData.getInstance(new Locale(sLocale));
			var mTimezoneTranslations = oLocaleData.getTimezoneTranslations();

			timezones.aABAPTimezoneIDs.forEach(function (sTimezoneId) {
				var sTranslationCldr = mTimezoneTranslations[sTimezoneId];
				if (aABAPUnsupportedIDs.includes(sTimezoneId)) {
					assert.notOk(sTranslationCldr, sLocale + ": no translation expected for " + sTimezoneId);
				} else {
					assert.ok(sTranslationCldr, sLocale + ": translation expected for " + sTimezoneId);
				}
			});

			assert.strictEqual(Object.values(mTimezoneTranslations).length,
				new Set(Object.values(mTimezoneTranslations)).size, sLocale + ": values must be unique");
		});
	});

	QUnit.test("getTimezoneTranslations generic structure test", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de"));
		var oStubIsValidTimezone = this.stub(TimezoneUtils, 'isValidTimezone').returns(true);
		var oStubGet = this.stub(oLocaleData, '_get');
		oStubGet.withArgs("timezoneNames").returns({
			a: {
				_parent: "AParent",
				a1: "A1",
				a2: "A2",
				a3: {
					a31: "A31",
					a32: "A32",
					a33: {
						a331: "A331",
						a332: "A332"
					},
					_parent: "A3Parent",
					a34: "A34"
				},
				a4: "A4",
				a5: {
					a51: "A51",
					a52: "A52",
					a53: {
						a531: "A531",
						a532: {
							a5321: "A5321",
							a5322: "A5322",
							_parent: "A532Parent"
						},
						a533: "A533",
						_parent: "A53Parent"
					},
					a54: "A54"
				}
			},
			b: {
				_parent: "BParent",
				b1: "B1",
				b2: {
					b21: {
						b211: "B211"
					},
					b22: "B22",
					_parent: "B2Parent"
				},
				b3: "B3"
			}
		});
		var mTimezoneNames = oLocaleData.getTimezoneTranslations();
		assert.deepEqual({
			"a/a1": "AParent, A1",
			"a/a2": "AParent, A2",
			"a/a3/a31": "AParent, A3Parent, A31",
			"a/a3/a32": "AParent, A3Parent, A32",
			"a/a3/a33/a331": "AParent, A3Parent, A331",
			"a/a3/a33/a332": "AParent, A3Parent, A332",
			"a/a3/a34": "AParent, A3Parent, A34",
			"a/a4": "AParent, A4",
			"a/a5/a51": "AParent, A51",
			"a/a5/a52": "AParent, A52",
			"a/a5/a53/a531": "AParent, A53Parent, A531",
			"a/a5/a53/a532/a5321": "AParent, A53Parent, A532Parent, A5321",
			"a/a5/a53/a532/a5322": "AParent, A53Parent, A532Parent, A5322",
			"a/a5/a53/a533": "AParent, A53Parent, A533",
			"a/a5/a54": "AParent, A54",
			"b/b1": "BParent, B1",
			"b/b2/b21/b211": "BParent, B2Parent, B211",
			"b/b2/b22": "BParent, B2Parent, B22",
			"b/b3": "BParent, B3"
		}, mTimezoneNames);

		oStubGet.restore();
		oStubIsValidTimezone.restore();
	});

	QUnit.test("getTimezoneTranslations", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de"));

		this.mock(oLocaleData).expects("_get").withExactArgs("timezoneNames").returns({"~Key": "~ValueDe"});

		// code under test: get "de" time zone translations and cache them globally
		var mTranslations = oLocaleData.getTimezoneTranslations();

		assert.deepEqual(mTranslations, {"~Key": "~ValueDe"});

		// code under test: get "de" time zone translations from cache; same locale data instance
		var mTranslations1 = oLocaleData.getTimezoneTranslations();

		assert.deepEqual(mTranslations1, {"~Key": "~ValueDe"});
		assert.notStrictEqual(mTranslations !== mTranslations1);

		oLocaleData = LocaleData.getInstance(new Locale("en"));

		this.mock(oLocaleData).expects("_get").withExactArgs("timezoneNames").returns({"~Key": "~ValueEn"});

		// code under test: get "en" time zone translations and cache them globally; don't overwrite "de" translations
		mTranslations = oLocaleData.getTimezoneTranslations();

		assert.deepEqual(mTranslations, {"~Key": "~ValueEn"});

		oLocaleData = LocaleData.getInstance(new Locale("de"));

		this.mock(oLocaleData).expects("_get").never();

		// code under test: get "de" time zone translations from cache; different locale data instance
		mTranslations = oLocaleData.getTimezoneTranslations();

		assert.deepEqual(mTranslations, {"~Key": "~ValueDe"});
	});

	QUnit.test("getLenientNumberSymbols", function(assert) {
		// unknown locale, en.json will be used
		var oLocaleData = LocaleData.getInstance(new Locale("xx-XX"));

		var sMinusSymbols = oLocaleData.getLenientNumberSymbols("minusSign");
		var sPlusSymbols = oLocaleData.getLenientNumberSymbols("plusSign");

		assert.strictEqual(sMinusSymbols, "-－﹣ ‐‑‒–−⁻₋➖", "Should match the minus symbols default");
		assert.strictEqual(sPlusSymbols, "+＋﬩﹢⁺₊ ➕", "Should match the plus symbols default");
	});

	//*********************************************************************************************
// See: https://unicode.org/reports/tr35/tr35-numbers.html#table-plural-operand-meanings
[{
	sNumber: "1",
	sPluralRule: "one",
	oOperands: {n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "12",
	sPluralRule: "other",
	oOperands: {n: 12, i: 12, v: 0, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "5000000",
	sPluralRule: "many",
	oOperands: {n: 5000000, i: 5000000, v: 0, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "5000000.0000",
	sPluralRule: "other",
	oOperands: {n: 5000000, i: 5000000, v: 4, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "5e6",
	sPluralRule: "many",
	oOperands: {n: 5000000, i: 5000000, v: 0, w: 0, f: 0, t: 0, c: 6}
}, {
	sNumber: "5.2e6",
	sPluralRule: "many",
	oOperands: {n: 5200000, i: 5200000, v: 0, w: 0, f: 0, t: 0, c: 6}
}, {
	sNumber: "5200000",
	sPluralRule: "other",
	oOperands: {n: 5200000, i: 5200000, v: 0, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "1.2E1",
	sPluralRule: "other",
	oOperands: {n: 12, i: 12, v: 0, w: 0, f: 0, t: 0, c: 1}
}].forEach(function (oFixture, i) {
	QUnit.test("Plural categories and operands, " + i, function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("es"));

		this.mock(oLocaleData)
			.expects("_get")
			.withExactArgs("plurals")
			.returns({
				one: "n = 1",
				many: "e = 0 and i != 0 and i % 1000000 = 0 and v = 0 or e != 0..5"
			});

		// code under test: check plural rule
		assert.strictEqual(oLocaleData.getPluralCategory(oFixture.sNumber), oFixture.sPluralRule);

		// code under test: check plural operands for number
		// note: plural test function for "one" is always called as this is the first category
		assert.deepEqual(oLocaleData._pluralTest.one(oFixture.sNumber).oOperands, oFixture.oOperands);
	});
});

	//*********************************************************************************************
// Tests from https://unicode.org/reports/tr35/tr35-numbers.html#table-plural-operand-meanings
// with the following changes (as the "e" operand may be redefined in the future):
// - leave out the "e" operand, as this is a deprecated alias for "c" and code in LocaleData only uses "c"
// - number literals containing "c" are also tested with an "e" variant as this is the scientific notation in JavaScript
[{
	sNumber: "1",
	oOperands: {n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "1.0",
	oOperands: {n: 1, i: 1, v: 1, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "1.00",
	oOperands: {n: 1, i: 1, v: 2, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "1.3",
	oOperands: {n: 1.3, i: 1, v: 1, w: 1, f: 3, t: 3, c: 0}
}, {
	sNumber: "1.30",
	oOperands: {n: 1.3, i: 1, v: 2, w: 1, f: 30, t: 3, c: 0}
}, {
	sNumber: "1.03",
	oOperands: {n: 1.03, i: 1, v: 2, w: 2, f: 3, t: 3, c: 0}
}, {
	sNumber: "1.230",
	oOperands: {n: 1.230, i: 1, v: 3, w: 2, f: 230, t: 23, c: 0}
}, {
	sNumber: "1200000",
	oOperands: {n: 1200000, i: 1200000, v: 0, w: 0, f: 0, t: 0, c: 0}
}, {
	sNumber: "1.2c6",
	oOperands: {n: 1200000, i: 1200000, v: 0, w: 0, f: 0, t: 0, c: 6}
}, {
	sNumber: "1.2e6",
	oOperands: {n: 1200000, i: 1200000, v: 0, w: 0, f: 0, t: 0, c: 6}
}, {
	sNumber: "123c6",
	oOperands: {n: 123000000, i: 123000000, v: 0, w: 0, f: 0, t: 0, c: 6}
}, {
	sNumber: "123e6",
	oOperands: {n: 123000000, i: 123000000, v: 0, w: 0, f: 0, t: 0, c: 6}
}, {
	sNumber: "123c5",
	oOperands: {n: 12300000, i: 12300000, v: 0, w: 0, f: 0, t: 0, c: 5}
}, {
	sNumber: "123e5",
	oOperands: {n: 12300000, i: 12300000, v: 0, w: 0, f: 0, t: 0, c: 5}
}, {
	sNumber: "1200.50",
	oOperands: {n: 1200.50, i: 1200, v: 2, w: 1, f: 50, t: 5, c: 0}
}, {
	sNumber: "1.20050c3",
	oOperands: {n: 1200.5, i: 1200, v: 2, w: 1, f: 50, t: 5, c: 3}
}, {
	sNumber: "1.20050e3",
	oOperands: {n: 1200.5, i: 1200, v: 2, w: 1, f: 50, t: 5, c: 3}
}].forEach(function (oFixture, i) {
	QUnit.test("Plural operands samples from Unicode page, " + i, function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("es"));

		// set plural rule function for oLocaleData object
		oLocaleData.getPluralCategory(oFixture.sNumber);

		// code under test: check plural operands for number
		// note: plural test function for "one" is always called as this is the first category
		assert.deepEqual(oLocaleData._pluralTest.one(oFixture.sNumber).oOperands, oFixture.oOperands);
	});
});

	//*********************************************************************************************
	// See: https://unicode-org.github.io/cldr-staging/charts/41/supplemental/language_plural_rules.html
	// Interesting: "1c6" and "1000000.0" have the same numeric value but lead to another plural category
[{
	category: "one",
	examples: ["0", "1", "1.5"]
}, {
	category: "many",
	examples: ["1000000", "1c6", "2c6", "3c6", "4c6", "5c6", "6c6",
		"1.0000001c6", "1.1c6", "2.0000001c6", "2.1c6", "3.0000001c6", "3.1c6"]
}, {
	category: "other",
	examples: ["2", "16", "100", "1000", "10000", "100000", "1c3", "2c3", "3c3", "4c3", "5c3", "6c3",
		"2.0", "3.5", "10.0", "100.0", "1000.0", "10000.0", "100000.0", "1000000.0", "1.0001c3", "1.1c3",
		"2.0001c3", "2.1c3", "3.0001c3", "3.1c3"]
}].forEach(function (oFixture) {
	QUnit.test("getPluralCategory: 'fr' examples; category=" + oFixture.category, function (assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("fr"));

		oFixture.examples.forEach(function (sNumber) {
			assert.strictEqual(oLocaleData.getPluralCategory(sNumber), oFixture.category);
		});
	});
});

	//*********************************************************************************************
[
	{vValue: 1, sResult : "1"},
	{vValue: 1e-6, sResult : "0.000001"},
	{vValue: 1e+20, sResult : "100000000000000000000"},
	// exponent can be "e" in lower-case or upper-case
	{vValue: "1.23e2", sResult : "123"},
	{vValue: "1.23E2", sResult : "123"},
	// positive exponent, exponent < fraction length
	{vValue: "1.0123456789012345678901e+21", sResult : "1012345678901234567890.1"},
	// positive exponent, exponent >= fraction length
	{vValue: "1.0123e+21", sResult : "1012300000000000000000"},
	{vValue: "1.012345678901234567890e+21", sResult : "1012345678901234567890"},
	// negative exponent, abs(exponent) < integer length
	{vValue: "12345678e-7", sResult : "1.2345678"},
	// negative exponent, abs(exponent) >= integer length
	{vValue: "12345e-7", sResult : "0.0012345"},
	{vValue: "12.345e-7", sResult : "0.0000012345"},
	// values with sign
	{vValue: "-1.0123456789012345678901e+21", sResult : "-1012345678901234567890.1"},
	{vValue: "+1.0123456789012345678901e+21", sResult : "1012345678901234567890.1"}
].forEach(function (oFixture, i) {
	QUnit.test("convertToDecimal, " + i, function (assert) {
		// code under test
		assert.strictEqual(LocaleData.convertToDecimal(oFixture.vValue), oFixture.sResult);
	});
});

	//*********************************************************************************************
	QUnit.test("getRelativePatterns: Unknown plural categories are not added to return value", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("de"));

		this.mock(oLocaleData).expects("getPluralCategories")
			.withExactArgs()
			.returns(["one", "other", "many"]);
		this.mock(oLocaleData).expects("_get")
			.withExactArgs("dateFields", "day-short")
			.returns({
				"relativeTime-type-future": {
					"relativeTimePattern-count-one": "foo {0}",
					"relativeTimePattern-count-other": "bar {0}"
				}
			});

		// code under test
		assert.deepEqual(oLocaleData.getRelativePatterns(["day"], "short"), [
			{scale: "day", sign: 1, pattern: "foo {0}"},
			{scale: "day", sign: 1, pattern: "bar {0}"}
		]);
	});
	/** @deprecated As of version 1.113.0 */
	QUnit.test("CustomLocaleData: getFirstDayOfWeek", function(assert) {
		var oCustomLocaleData = LocaleData.getInstance(new Locale("en_US-x-sapufmt")),
			oFormatSettings = Configuration.getFormatSettings();

		// code under test - first day of week from CLDR
		assert.strictEqual(oCustomLocaleData.getFirstDayOfWeek(), 0);

		oFormatSettings.setFirstDayOfWeek(6);

		// code under test - first day of week from FormatSettings
		assert.strictEqual(oCustomLocaleData.getFirstDayOfWeek(), 6);

		Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.ISO_8601);

		// code under test - first day of week from CalendarWeekNumbering.ISO_8601
		assert.strictEqual(oCustomLocaleData.getFirstDayOfWeek(), 1);

		// clean up configuration
		Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.Default);
		//TODO oFormatSettings.setFirstDayOfWeek(null); - does not work currently
	});

	//*********************************************************************************************
	QUnit.test("CustomLocaleData: getMinimalDaysInFirstWeek", function(assert) {
		var oCustomLocaleData = LocaleData.getInstance(new Locale("en_US-x-sapufmt"));

		// code under test - min days in 1st week from CLDR
		assert.strictEqual(oCustomLocaleData.getMinimalDaysInFirstWeek(), 1);

		Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.ISO_8601);

		// code under test - min days in 1st week from CalendarWeekNumbering.ISO_8601
		assert.strictEqual(oCustomLocaleData.getMinimalDaysInFirstWeek(), 4);

		// clean up configuration
		Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.Default);
	});

	//*********************************************************************************************
[
	{fallbackPattern: "{0} \u2013 {1}", result: "~pattern \u2013 ~pattern"},
	{fallbackPattern: "{0} - {1}", result: "~pattern - ~pattern"},
	{fallbackPattern: "{0}-{1}", result: "~pattern-~pattern"},
	{fallbackPattern: "{0} a el {1}", result: "~pattern 'a el' ~pattern"},
	{fallbackPattern: "{0}\u2013{1}", result: "~pattern\u2013~pattern"},
	{fallbackPattern: "{0} \u2018al\u2019 {1}", result: "~pattern '\u2018al\u2019' ~pattern"},
	{fallbackPattern: "{0} \u062a\u0627 {1}", result: "~pattern \u062a\u0627 ~pattern"},
	{fallbackPattern: "du {0} au {1}", result: "'du' ~pattern 'au' ~pattern"},
	{fallbackPattern: "{0}\uff5e{1}", result: "~pattern\uff5e~pattern"},
	{fallbackPattern: "{0} ~ {1}", result: "~pattern ~ ~pattern"},
	{fallbackPattern: "{0}\u81f3{1}", result: "~pattern\u81f3~pattern"}
].forEach((oFixture, i) => {
	QUnit.test("getCombinedIntervalPattern: integrative #" + i, function (assert) {
		const oLocaleData = {_get() {}};
		this.mock(oLocaleData).expects("_get").withExactArgs("ca-~calendar", "dateTimeFormats", "intervalFormats")
			.returns({intervalFormatFallback: oFixture.fallbackPattern});

		// code under test
		assert.strictEqual(LocaleData.prototype.getCombinedIntervalPattern.call(oLocaleData, "~pattern", "~calendar"),
			oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("getCombinedIntervalPattern", function (assert) {
		const oLocaleData = {_get() {}};
		this.mock(oLocaleData).expects("_get").withExactArgs("ca-~calendar", "dateTimeFormats", "intervalFormats")
			.returns({intervalFormatFallback: "prefix{0}infix{1}suffix"});
		const oLocaleDataMock = this.mock(LocaleData);
		oLocaleDataMock.expects("_escapeIfNeeded").withExactArgs("prefix").returns("~p");
		oLocaleDataMock.expects("_escapeIfNeeded").withExactArgs("infix").returns("~i");
		oLocaleDataMock.expects("_escapeIfNeeded").withExactArgs("suffix").returns("~s");

		// code under test
		assert.strictEqual(LocaleData.prototype.getCombinedIntervalPattern.call(oLocaleData, "~pattern", "~calendar"),
			"~p~pattern~i~pattern~s");
	});

	//*********************************************************************************************
	QUnit.test("_escapeIfNeeded: value contains a CLDR symbol -> escape", function (assert) {
		// all CLDR symbols in alphabetic order
		Array.from("ABDEFGHKLMOQSUVWXYZabcdeghkmqrsuvwxyz").forEach((sSymbol) => {
			const sValue = "~" + sSymbol + "~";

			// code under test
			assert.strictEqual(LocaleData._escapeIfNeeded(sValue), "'" + sValue + "'", sSymbol);

			["\t", " ", "\u00a0", "\u2009", "\u202f"].forEach((sSpace) => {
				const sValueWithSpaces = sSpace + sSpace + sValue + sSpace + sSpace;

				// code under test
				assert.strictEqual(LocaleData._escapeIfNeeded(sValueWithSpaces),
					sSpace + "'" + sSpace + sValue + sSpace + "'" + sSpace,
					"\\u" + sSpace.charCodeAt(0).toString(16).padStart(4, "0"));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_escapeIfNeeded: value does not contain a CLDR symbol -> no escaping", function (assert) {
		// some characters that aren't a CLDR symbol
		Array.from("CIJNPRTfijlnopt\u2013-~\uff5e\u81f3").forEach((sSymbol) => {
			const sValue = "~" + sSymbol + "~";

			// code under test
			assert.strictEqual(LocaleData._escapeIfNeeded(sValue), sValue, sSymbol);

			["\t", " ", "\u00a0", "\u2009", "\u202f"].forEach((sSpace) => {
				const sValueWithSpaces = sSpace + sSpace + sValue + sSpace + sSpace;
				// code under test
				assert.strictEqual(LocaleData._escapeIfNeeded(sValueWithSpaces), sValueWithSpaces,
					"\\u" + sSpace.charCodeAt(0).toString(16).padStart(4, "0"));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getLanguageName: throws TypeError for wrong language tag", function (assert) {
		// code under test
		assert.throws(() => {
			LocaleData.prototype.getLanguageName.call({/*oLocaleData*/}, "wronglanguage");
		}, TypeError);
	});

	//*********************************************************************************************
[
	{languageTag: "en", result: "~EN"},
	{languageTag: "en_US", result: "~EN~US"},
	{languageTag: "en-US", result: "~EN~US"}
].forEach((oFixture, i) => {
	QUnit.test(`getLanguageName: found in languages object, ${oFixture.languageTag}`, function (assert) {
		const oLocaleData = {_get() {}};
		this.mock(Localization).expects("getModernLanguage").withExactArgs("en").returns("en");
		this.mock(oLocaleData).expects("_get").withExactArgs("languages").returns({"en": "~EN", "en_US": "~EN~US"});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, oFixture.languageTag),
			oFixture.result);
	});
});

	//*********************************************************************************************
[
	{languageTag: "zh_Hant", result: "~Chinese (~Traditional)"},
	{languageTag: "zh-Hant", result: "~Chinese (~Traditional)"}
].forEach((oFixture, i) => {
	QUnit.test(`getLanguageName: using script, ${oFixture.languageTag}`, function (assert) {
		const oLocaleData = {_get() {}};
		const oLocaleDataMock = this.mock(oLocaleData);
		this.mock(Localization).expects("getModernLanguage").withExactArgs("zh").returns("zh");
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns({"zh": "~Chinese"});
		oLocaleDataMock.expects("_get").withExactArgs("scripts").returns({"Hant": "~Traditional"});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, oFixture.languageTag),
			oFixture.result);
	});
});

	//*********************************************************************************************
[
	{languageTag: "en_AU", result: "~ENGLISH (~Australia)"},
	{languageTag: "en-AU", result: "~ENGLISH (~Australia)"}
].forEach((oFixture, i) => {
	QUnit.test(`getLanguageName: using territories, ${oFixture.languageTag}`, function (assert) {
		const oLocaleData = {_get() {}};
		const oLocaleDataMock = this.mock(oLocaleData);
		this.mock(Localization).expects("getModernLanguage").withExactArgs("en").returns("en");
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns({"en": "~ENGLISH"});
		oLocaleDataMock.expects("_get").withExactArgs("territories").returns({"AU": "~Australia"});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, oFixture.languageTag),
			oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("getLanguageName: language not found", function (assert) {
		const oLocaleData = {_get() {}};
		const oLocaleDataMock = this.mock(oLocaleData);
		this.mock(Localization).expects("getModernLanguage").withExactArgs("zz").returns("zz");
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns({"en": "~ENGLISH"});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, "zz"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getLanguageName: tag with region but language not found", function (assert) {
		const oLocaleData = {_get() {}};
		const oLocaleDataMock = this.mock(oLocaleData);
		this.mock(Localization).expects("getModernLanguage").withExactArgs("zz").returns("zz");
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns({"en": "~ENGLISH"});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, "zz_AU"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getLanguageName: language found but script not", function (assert) {
		const oLocaleData = {_get() {}};
		const oLocaleDataMock = this.mock(oLocaleData);
		this.mock(Localization).expects("getModernLanguage").withExactArgs("en").returns("en");
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns({"en": "~ENGLISH"});
		oLocaleDataMock.expects("_get").withExactArgs("scripts").returns({});
		oLocaleDataMock.expects("_get").withExactArgs("territories").never();

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, "en_Scri"), "~ENGLISH");
	});

	//*********************************************************************************************
	QUnit.test("getLanguageName: language found but territory not", function (assert) {
		const oLocaleData = {_get() {}};
		const oLocaleDataMock = this.mock(oLocaleData);
		this.mock(Localization).expects("getModernLanguage").withExactArgs("en").returns("en");
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns({"en": "~ENGLISH"});
		oLocaleDataMock.expects("_get").withExactArgs("scripts").never();
		oLocaleDataMock.expects("_get").withExactArgs("territories").returns({});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, "en_ZZ"), "~ENGLISH");
	});

	//*********************************************************************************************
	QUnit.test("getLanguageName: special modern language different", function (assert) {
		const oLocaleData = {_get() {}};
		this.mock(Localization).expects("getModernLanguage").withExactArgs("iw").returns("he");
		this.mock(oLocaleData).expects("_get").withExactArgs("languages").returns({"he": "~HE"});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, "iw"), "~HE");
	});

	//*********************************************************************************************
	QUnit.test("getLanguageName: special cases sr_Latn", function (assert) {
		const oLocaleData = {_get() {}};
		this.mock(Localization).expects("getModernLanguage").withExactArgs("sr").returns("sr");
		this.mock(oLocaleData).expects("_get").withExactArgs("languages").returns({"sh": "~SH"});

		// code under test
		assert.strictEqual(LocaleData.prototype.getLanguageName.call(oLocaleData, "sr_Latn"), "~SH");
	});

	/** @deprecated As of version 1.120.0 */
	QUnit.test("getLanguages: ensure missing entries are added", function (assert) {
		const oLocaleData = {
			_get() {},
			getLanguageName() {}
		};
		const oLocaleDataMock = this.mock(oLocaleData);
		const oLanguages = {de: "~DE", en: "~EN"};
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns(oLanguages);
		[
			"ar_001", "de_AT", "de_CH", "en_AU", "en_CA", "en_GB", "en_US", "es_419", "es_ES", "es_MX", "fa_AF",
			"fr_CA", "fr_CH", "nds_NL", "nl_BE", "pt_BR", "pt_PT", "ro_MD", "sw_CD", "zh_Hans", "zh_Hant"
		].forEach((sLanguageTag) => {
			oLocaleDataMock.expects("getLanguageName").withExactArgs(sLanguageTag).returns("~" + sLanguageTag);
		});
		const oExpectedResult = {
			"de": "~DE",
			"en": "~EN",
			"ar_001": "~ar_001",
			"de_AT": "~de_AT",
			"de_CH": "~de_CH",
			"en_AU": "~en_AU",
			"en_CA": "~en_CA",
			"en_GB": "~en_GB",
			"en_US": "~en_US",
			"es_419": "~es_419",
			"es_ES": "~es_ES",
			"es_MX": "~es_MX",
			"fa_AF": "~fa_AF",
			"fr_CA": "~fr_CA",
			"fr_CH": "~fr_CH",
			"nds_NL": "~nds_NL",
			"nl_BE": "~nl_BE",
			"pt_BR": "~pt_BR",
			"pt_PT": "~pt_PT",
			"ro_MD": "~ro_MD",
			"sw_CD": "~sw_CD",
			"zh_Hans": "~zh_Hans",
			"zh_Hant": "~zh_Hant"
		};

		// code under test
		assert.deepEqual(LocaleData.prototype.getLanguages.call(oLocaleData), oExpectedResult);

		// original languages object has been enhanced - no need to do replacement twice
		assert.deepEqual(oExpectedResult, oLanguages);
	});

/** @deprecated As of version 1.120.0 */
[
	"ar_001", "de_AT", "de_CH", "en_AU", "en_CA", "en_GB", "en_US", "es_419", "es_ES", "es_MX", "fa_AF",
	"fr_CA", "fr_CH", "nds_NL", "nl_BE", "pt_BR", "pt_PT", "ro_MD", "sw_CD", "zh_Hans", "zh_Hant"
].forEach((sLanguageTag) => {
	QUnit.test(`getLanguages: don't overwrite existing entry ${sLanguageTag}`, function (assert) {
		const oLocaleData = {
			_get() {},
			getLanguageName() {}
		};
		const oLocaleDataMock = this.mock(oLocaleData);
		const oLanguages = {};
		oLanguages[sLanguageTag] = "~" + sLanguageTag + "_original";
		oLocaleDataMock.expects("_get").withExactArgs("languages").returns(oLanguages);
		[
			"ar_001", "de_AT", "de_CH", "en_AU", "en_CA", "en_GB", "en_US", "es_419", "es_ES", "es_MX", "fa_AF",
			"fr_CA", "fr_CH", "nds_NL", "nl_BE", "pt_BR", "pt_PT", "ro_MD", "sw_CD", "zh_Hans", "zh_Hant"
		].forEach((sLanguageTag0) => {
			if (sLanguageTag0 !== sLanguageTag) {
				oLocaleDataMock.expects("getLanguageName").withExactArgs(sLanguageTag0).returns("~" + sLanguageTag0);
			}
		});
		const oExpectedResult = {
			"ar_001": "~ar_001",
			"de_AT": "~de_AT",
			"de_CH": "~de_CH",
			"en_AU": "~en_AU",
			"en_CA": "~en_CA",
			"en_GB": "~en_GB",
			"en_US": "~en_US",
			"es_419": "~es_419",
			"es_ES": "~es_ES",
			"es_MX": "~es_MX",
			"fa_AF": "~fa_AF",
			"fr_CA": "~fr_CA",
			"fr_CH": "~fr_CH",
			"nds_NL": "~nds_NL",
			"nl_BE": "~nl_BE",
			"pt_BR": "~pt_BR",
			"pt_PT": "~pt_PT",
			"ro_MD": "~ro_MD",
			"sw_CD": "~sw_CD",
			"zh_Hans": "~zh_Hans",
			"zh_Hant": "~zh_Hant"
		};
		oExpectedResult[sLanguageTag] = "~" + sLanguageTag + "_original"; // don't overwrite existing entry

		// code under test
		assert.deepEqual(LocaleData.prototype.getLanguages.call(oLocaleData), oExpectedResult);
	});
});

	//*********************************************************************************************
["narrow", "abbreviated", "wide"].forEach((sWidth) => {
	QUnit.test("getMonths: returns first alternative, " + sWidth, function (assert) {
		const oLocalData = {
			_get() {}
		};
		this.mock(oLocalData).expects("_get")
			.withExactArgs("ca-~scalendartype", "months", "format", sWidth)
			.returns([["a", "b"], "c", "d", ["e", "f", "g"], "h"]);

		// code under test
		assert.deepEqual(LocaleData.prototype.getMonths.call(oLocalData, sWidth, "~sCalendarType"),
			["a", "c", "d", "e", "h"]);
	});
});
	//*********************************************************************************************
["narrow", "abbreviated", "wide"].forEach((sWidth) => {
	QUnit.test("_getMonthsWithAlternatives: " + sWidth, function (assert) {
		const oLocalData = {
			_get() {}
		};
		this.mock(oLocalData).expects("_get")
			.withExactArgs("ca-~scalendartype", "months", "format", sWidth)
			.returns("~result");

		// code under test
		assert.deepEqual(LocaleData.prototype._getMonthsWithAlternatives.call(oLocalData, sWidth, "~sCalendarType"),
			"~result");
	});
});

	//*********************************************************************************************
["narrow", "abbreviated", "wide"].forEach((sWidth) => {
	QUnit.test("getMonthsStandAlone: returns first alternative, " + sWidth, function (assert) {
		const oLocalData = {
			_get() {}
		};
		this.mock(oLocalData).expects("_get")
			.withExactArgs("ca-~scalendartype", "months", "stand-alone", sWidth)
			.returns([["a", "b"], "c", "d", ["e", "f", "g"], "h"]);

		// code under test
		assert.deepEqual(LocaleData.prototype.getMonthsStandAlone.call(oLocalData, sWidth, "~sCalendarType"),
			["a", "c", "d", "e", "h"]);
	});
});
	//*********************************************************************************************
["narrow", "abbreviated", "wide"].forEach((sWidth) => {
	QUnit.test("_getMonthsStandAloneWithAlternatives: " + sWidth, function (assert) {
		const oLocalData = {
			_get() {}
		};
		this.mock(oLocalData).expects("_get")
			.withExactArgs("ca-~scalendartype", "months", "stand-alone", sWidth)
			.returns("~result");

		// code under test
		assert.deepEqual(
			LocaleData.prototype._getMonthsStandAloneWithAlternatives.call(oLocalData, sWidth, "~sCalendarType"),
			"~result");
	});
});

	//*********************************************************************************************
[
	{aArguments: ["~anyNumber"], sKey: "date.week.calendarweek.wide", sNumber: "~anyNumber", sStyle: "wide"},
	{aArguments: ["~anyNumber"], sKey: "date.week.calendarweek.narrow", sNumber: "~anyNumber", sStyle: "narrow"},
	{aArguments: undefined, sKey: "date.week.calendarweek.wide", sNumber: "", sStyle: "wide"},
	{aArguments: undefined, sKey: "date.week.calendarweek.narrow", sNumber: undefined, sStyle: "narrow"}
].forEach((oFixture, i) => {
	QUnit.test("getCalendarWeek: #" + i, function (assert) {
		const oLocaleData = {
			oLocale: {
				toString() { return "~locale"; }
			}
		};
		const oBundle = {getText() {}};
		this.mock(Lib).expects("getResourceBundleFor").withExactArgs("sap.ui.core", "~locale").returns(oBundle);
		this.mock(oBundle).expects("getText").withExactArgs(oFixture.sKey, oFixture.aArguments).returns("~result");

		// code under test
		assert.strictEqual(LocaleData.prototype.getCalendarWeek.call(oLocaleData, oFixture.sStyle, oFixture.sNumber),
			"~result");
	});
});
});
