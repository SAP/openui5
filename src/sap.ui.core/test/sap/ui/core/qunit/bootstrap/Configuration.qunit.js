/*global QUnit, sinon */

/**
 * @fileoverview
 * @deprecated
 */
sap.ui.define([
	'sap/ui/core/CalendarType',
	'sap/ui/core/Configuration',
	'sap/ui/core/Core',
	'sap/ui/core/Lib',
	'sap/ui/core/date/CalendarWeekNumbering',
	'sap/ui/core/Theming',
	'sap/base/config',
	'sap/base/Log',
	"sap/base/config/GlobalConfigurationProvider",
	'sap/base/i18n/date/TimezoneUtils',
	'../routing/HistoryUtils',
	'sap/ui/base/config/URLConfigurationProvider',
	'sap/ui/core/LocaleData' // only used indirectly via Configuration.getCalendarType
], function(CalendarType, Configuration, Core, Library, CalendarWeekNumbering, Theming, BaseConfig, Log,
		GlobalConfigurationProvider, TimezoneUtils, HistoryUtils, URLConfigurationProvider/*, LocaleData*/) {
	"use strict";

	var browserUrl = {
		change: function(sUrl) {
			if (sUrl) {
				if (!this.href) {
					this.href = window.location.href;
				}
				window.history.pushState({},"Test URL", sUrl);
			}
		},
		reset: function() {
			if (this.href) {
				window.history.pushState({},"Test URL reset", this.href);
				this.href = null;
			}
		}
	};

	var AnimationMode = Configuration.AnimationMode;
	let mConfigStubValues = {};

	var sLocalTimezone = TimezoneUtils.getLocalTimezone();

	function getHtmlAttribute(sAttribute) {
		return document.documentElement.getAttribute(sAttribute);
	}

	// Initialize the HistoryUtils
	QUnit.begin(HistoryUtils.init);

	// Resets the HistoryUtils
	QUnit.done(HistoryUtils.exit);

	QUnit.module("Basic");

	QUnit.test("Constructor", function(assert) {
		var oLogSpy = sinon.stub(Log, "error");
		var oConfiguration1 = new Configuration();
		var oConfiguration2 = new Configuration();
		var sExpectedErrorText = "Configuration is designed as a singleton and should not be created manually! " +
			"Please require 'sap/ui/core/Configuration' instead and use the module export directly without using 'new'.";

		assert.strictEqual(oConfiguration1, oConfiguration2, "Constructor of configuration should always return the same instance.");
		assert.ok(oLogSpy.calledTwice, "There should be two errors logged for each constructor call.");
		assert.strictEqual(oLogSpy.getCall(0).args[0], sExpectedErrorText, "Correct error logged");
		assert.strictEqual(oLogSpy.getCall(1).args[0], sExpectedErrorText, "Correct error logged");
		assert.strictEqual(oConfiguration1.getCalendarWeekNumbering(), CalendarWeekNumbering.Default,
			"calendar week number is set to default in c'tor");
		oLogSpy.restore();
	});

	QUnit.test("Settings", function(assert) {
		assert.equal(Configuration.getTheme(), "SapSampleTheme2", "tag config should override global config");
		assert.ok(Library.all()["sap.ui.core"], "Core library loaded");
	});

	QUnit.test("jQuery and $", function(assert) {
		// we configured noConflict=true, so $ shouldn't be the same as jQuery
		assert.ok(window.jQuery, "window.jQuery is available");
		assert.ok(!window.$ || window.$ !== window.jQuery, "window.$ not available or not the same as jQuery");
	});

	QUnit.test("LegacyDateCalendarCustomizing", function(assert) {
		var oFormatSettings = Configuration.getFormatSettings();

		var aData = [{
			"dateFormat": "A",
			"islamicMonthStart": "14351201",
			"gregDate": "20140925"
		}, {
			"dateFormat": "A",
			"islamicMonthStart": "14360101",
			"gregDate": "20141024"
		}, {
			"dateFormat": "A",
			"islamicMonthStart": "14360201",
			"gregDate": "20141123"
		}];

		assert.ok(oFormatSettings, "FormatSettings object is created");
		oFormatSettings.setLegacyDateCalendarCustomizing(aData);
		assert.deepEqual(oFormatSettings.getLegacyDateCalendarCustomizing(), aData, "The customizing data set can be retrieved");
	});

	QUnit.test("getter and setter for option 'calendar'", function(assert) {
		var oCfg = Configuration,
			oFormatSettings = oCfg.getFormatSettings();
			oFormatSettings.setLegacyDateFormat();

		assert.equal(oCfg.getCalendarType(), CalendarType.Islamic, "The bootstrap parameter is respected");

		oCfg.setCalendarType(null);
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The default calendar type is determined using the current locale");

		oCfg.setLanguage("ar_SA");
		assert.equal(oCfg.getCalendarType(), CalendarType.Islamic, "The default calendar type for ar_SA is islamic");

		oFormatSettings.setLegacyDateFormat("1");
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The legacy date format '1' changes the calendar type to gregorian");

		oFormatSettings.setLegacyDateFormat("2");
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The legacy date format '2' changes the calendar type to gregorian");

		oFormatSettings.setLegacyDateFormat("3");
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The legacy date format '3' changes the calendar type to gregorian");

		oFormatSettings.setLegacyDateFormat("4");
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The legacy date format '4' changes the calendar type to gregorian");

		oFormatSettings.setLegacyDateFormat("5");
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The legacy date format '5' changes the calendar type to gregorian");

		oFormatSettings.setLegacyDateFormat("6");
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The legacy date format '6' changes the calendar type to gregorian");

		oFormatSettings.setLegacyDateFormat(null);
		assert.equal(oCfg.getCalendarType(), CalendarType.Islamic, "The default calendar type for ar_SA is islamic");

		oCfg.setLanguage("en_US");
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The default calendar type for en_US is gregorian");

		oFormatSettings.setLegacyDateFormat("A");
		assert.equal(oCfg.getCalendarType(), CalendarType.Islamic, "The legacy date format 'A' changes the calendar type to islamic");

		oCfg.setCalendarType(CalendarType.Gregorian);
		assert.equal(oCfg.getCalendarType(), CalendarType.Gregorian, "The calendar type is modified back to gregorian via calling setCalendarType");

		oCfg.setCalendarType(null);
		oFormatSettings.setLegacyDateFormat("B");
		assert.equal(oCfg.getCalendarType(), CalendarType.Islamic, "The legacy date format 'B' changes the calendar type to islamic");

		oFormatSettings.setLegacyDateFormat("7");
		assert.equal(oCfg.getCalendarType(), CalendarType.Japanese, "The legacy date format '7' changes the calendar type to japanese");

		oFormatSettings.setLegacyDateFormat("A");
		assert.equal(oCfg.getCalendarType(), CalendarType.Islamic, "The legacy date format 'A' changes the calendar type to islamic");
		oFormatSettings.setLegacyDateFormat("8");
		assert.equal(oCfg.getCalendarType(), CalendarType.Japanese, "The legacy date format '8' changes the calendar type to japanese");

		oFormatSettings.setLegacyDateFormat("A");
		assert.equal(oCfg.getCalendarType(), CalendarType.Islamic, "The legacy date format 'A' changes the calendar type to islamic");
		oFormatSettings.setLegacyDateFormat("9");
		assert.equal(oCfg.getCalendarType(), CalendarType.Japanese, "The legacy date format '9' changes the calendar type to japanese");

		oFormatSettings.setLegacyDateFormat("C");
		assert.equal(oCfg.getCalendarType(), CalendarType.Persian, "The legacy date format 'C' changes the calendar type to persian");
		//reset language
		oCfg.setLanguage("en");
	});

	QUnit.test("getter and setter for option calendarWeekNumbering", function(assert) {
		assert.strictEqual(Configuration.getCalendarWeekNumbering(), CalendarWeekNumbering.Default);

		assert.ok(Configuration.setCalendarWeekNumbering(CalendarWeekNumbering.ISO_8601), Configuration);
		assert.strictEqual(Configuration.getCalendarWeekNumbering(), CalendarWeekNumbering.ISO_8601);

		assert.throws(function() {
			Configuration.setCalendarWeekNumbering("invalid");
		}, new TypeError("Unsupported Enumeration value for calendarWeekNumbering, valid values are: "
				+ "Default, ISO_8601, MiddleEastern, WesternTraditional"));
	});


	QUnit.module("localization change", {
		beforeEach: function(assert) {
			this.reset = function() {
				this.eventsReceived = 0;
				this.changes = [];
			};
			this.reset();
			this.oCoreMock = {
				fireLocalizationChanged: function(changes) {
					this.eventsReceived++;
					this.changes.push(changes);
				}.bind(this)
			};
			Configuration.setRTL(null);
			Configuration.setLanguage("en");
			Configuration.setCalendarWeekNumbering(CalendarWeekNumbering.Default);
			Configuration.setCalendarType("Gregorian");
			Configuration.setCore(this.oCoreMock);
			this.oConfig = Configuration;
		}
	});

	QUnit.test("setCalendarWeekNumbering", function(assert) {
		this.oConfig.setCalendarWeekNumbering(CalendarWeekNumbering.Default);
		assert.equal(this.eventsReceived, 0, "no localizationChange event if value did not change");
		this.oConfig.setCalendarWeekNumbering(CalendarWeekNumbering.ISO_8601);
		assert.equal(this.eventsReceived, 1, "one localizationChange event if value changed");
	});

	QUnit.test("setLanguage(en) - noop", function(assert) {
		this.oConfig.setLanguage("en");
		assert.equal(this.oConfig.getLanguage(), "en", "language still should be 'en'");
		assert.equal(this.oConfig.getSAPLogonLanguage(), "EN", "SAP Logon language should be 'EN'");
		assert.equal(this.eventsReceived, 0, "one localizationChange event should have been fired");
	});

	QUnit.test("setLanguage(fr, FR) - simple", function(assert) {
		this.oConfig.setLanguage("fr", "fr");
		assert.equal(this.oConfig.getLanguage(), "fr", "language still should be 'fr'");
		assert.equal(this.oConfig.getSAPLogonLanguage(), "FR", "SAP Logon language should be 'FR'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]), ['language'], "event should have reported 'language' as changed");
	});

	QUnit.test("setLanguage(de) - simple", function(assert) {
		this.oConfig.setLanguage("de");
		assert.equal(this.oConfig.getLanguage(), "de", "language should have changed to 'de'");
		assert.equal(this.oConfig.getSAPLogonLanguage(), "DE", "SAP Logon language should be 'DE'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]), ['language'], "event should have reported 'language' as changed");
	});

	QUnit.test("setLanguage(he) - multi", function(assert) {
		this.oConfig.setLanguage("he");
		assert.equal(this.oConfig.getLanguage(), "he", "language should have changed to 'he'");
		assert.equal(this.oConfig.getSAPLogonLanguage(), "HE", "SAP Logon language should be 'HE'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]).sort(), ['language', 'rtl'], "event should have reported 'language' and 'rtl' as changed");
	});

	QUnit.test("setLanguage(invalid)", function(assert) {
		var that = this;
		assert.throws(function() {
			that.oConfig.setLanguage(new Date());
		}, "setting anything but a string should cause an error");
		assert.throws(function() {
			that.oConfig.setLanguage({ toString : function() { return "en-GB"; }});
		}, "setting anything that only looks like a string should throw error");
	});

	QUnit.test("setTimezone to the local timezone - noop", function(assert) {
		this.oConfig.setTimezone(sLocalTimezone);
		assert.equal(this.oConfig.getTimezone(), sLocalTimezone, "timezone still should be '" + sLocalTimezone + "'");
		assert.equal(this.eventsReceived, 0, "no localizationChange event should have been fired");
	});

	QUnit.test("setTimezone('America/New_York') - simple", function(assert) {
		var sDifferentTimezone = sLocalTimezone === "Europe/Berlin" ? "America/New_York" : "Europe/Berlin";
		this.oConfig.setTimezone(sDifferentTimezone);
		assert.equal(this.oConfig.getTimezone(), sDifferentTimezone, "timezone should be '" + sDifferentTimezone + "'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]), ['timezone'], "event should have reported 'timezone' as changed");
		// reset to local timezone
		this.oConfig.setTimezone(sLocalTimezone);
	});

	QUnit.test("setTimezone(null) - simple", function(assert) {
		this.oConfig.setTimezone(null);
		assert.equal(this.oConfig.getTimezone(), sLocalTimezone, "timezone still should be '" + sLocalTimezone + "'");
		assert.equal(this.eventsReceived, 0, "no localizationChange event should have been fired");
	});

	QUnit.test("setRTL(null) - noop", function(assert) {
		assert.equal(this.oConfig.getRTL(), false, "[precondition] RTL should be false for 'en'");
		this.oConfig.setRTL(null);
		assert.equal(this.oConfig.getRTL(), false, "RTL still should be false for 'en'");
		assert.equal(this.eventsReceived, 0, "no localizationChange event should have been fired");
		this.oConfig.setLanguage("he");
		assert.equal(this.oConfig.getRTL(), true, "language 'he' should change the RTL flag when none (null) had been set");
	});

	QUnit.test("setRTL(false) - noop", function(assert) {
		assert.equal(this.oConfig.getRTL(), false, "[precondition] RTL should be false for 'en'");
		this.oConfig.setRTL(false);
		assert.equal(this.oConfig.getRTL(), false, "RTL still should be false for 'en'");
		assert.equal(this.eventsReceived, 0, "no localizationChange event should have been fired");
		this.oConfig.setLanguage("he");
		assert.equal(this.oConfig.getRTL(), false, "language 'he' must not change the explicitly configured RTL flag");
	});

	QUnit.test("setRTL(true) - change", function(assert) {
		assert.equal(this.oConfig.getRTL(), false, "[precondition] RTL should be false for 'en'");
		this.oConfig.setRTL(true);
		assert.equal(this.oConfig.getRTL(), true, "RTL still should be false for 'en'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]).sort(), ['rtl'], "event should have reported 'rtl' as changed");
	});

	QUnit.test("setLegacyDateFormat", function(assert) {
		this.oConfig.getFormatSettings().setLegacyDateFormat("1");
		assert.equal(this.oConfig.getFormatSettings().getLegacyDateFormat(), "1", "legacy date format should have changed to '1'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]).sort(), ['dateFormats-medium', 'dateFormats-short', 'legacyDateFormat'], "event should have reported 'language' and 'rtl' as changed");
		assert.ok(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should contain private extension 'sapufmt'");

		// unset again
		this.oConfig.getFormatSettings().setLegacyDateFormat();
		assert.notOk(this.oConfig.getFormatSettings().getLegacyDateFormat(), "legacy date format should have been unset");
		assert.notOk(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should no longer contain private extension 'sapufmt'");
	});

	QUnit.test("setLegacyTimeFormat", function(assert) {
		this.oConfig.getFormatSettings().setLegacyTimeFormat("1");
		assert.equal(this.oConfig.getFormatSettings().getLegacyTimeFormat(), "1", "legacy time format should have changed to '1'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]).sort(), ['dayPeriods-format-abbreviated', 'legacyTimeFormat', 'timeFormats-medium', 'timeFormats-short'], "event should have reported 'language' and 'rtl' as changed");
		assert.ok(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should contain private extension 'sapufmt'");

		// unset again
		this.oConfig.getFormatSettings().setLegacyTimeFormat();
		assert.notOk(this.oConfig.getFormatSettings().getLegacyTimeFormat(), "legacy date format should have been unset");
		assert.notOk(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should no longer contain private extension 'sapufmt'");
	});

	QUnit.test("setTrailingCurrencyCode", function(assert) {
		assert.equal(this.oConfig.getFormatSettings().getTrailingCurrencyCode(), true, "Default configuration is true");

		this.oConfig.getFormatSettings().setTrailingCurrencyCode(false);
		assert.equal(this.oConfig.getFormatSettings().getTrailingCurrencyCode(), false, "Configuration set to false");

		this.oConfig.getFormatSettings().setTrailingCurrencyCode(true);
		assert.equal(this.oConfig.getFormatSettings().getTrailingCurrencyCode(), true, "Configuration set to true");
	});

	QUnit.test("applySettings", function(assert) {
		this.oConfig.applySettings({
			language: 'he',
			formatSettings: {
				legacyDateFormat: '1',
				legacyTimeFormat: '1'
			},
			calendarType: 'Islamic',
			calendarWeekNumbering: CalendarWeekNumbering.ISO_8601
		});
		assert.equal(this.oConfig.getCalendarWeekNumbering(), CalendarWeekNumbering.ISO_8601, "calendar week number changed to 'ISO_8601'");
		assert.equal(this.oConfig.getLanguage(), "he", "language should have changed to 'he'");
		assert.equal(this.oConfig.getRTL(), true, "RTL should have changed to true");
		assert.equal(this.oConfig.getFormatSettings().getLegacyDateFormat(), "1", "legacy date format should have changed to '1'");
		assert.equal(this.oConfig.getFormatSettings().getLegacyTimeFormat(), "1", "legacy time format should have changed to '1'");
		assert.ok(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should contain private extension 'sapufmt'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]).sort(), [
			'calendarType',
			'calendarWeekNumbering',
			'dateFormats-medium',
			'dateFormats-short',
			'dayPeriods-format-abbreviated',
			'language',
			'legacyDateFormat',
			'legacyTimeFormat',
			'rtl',
			'timeFormats-medium',
			'timeFormats-short'], "event should have reported the expected settings as changed");

		// unset again
		this.oConfig.applySettings({
			language: 'en',
			formatSettings: {
				legacyDateFormat: null,
				legacyTimeFormat: null
			},
			calendarType: null,
			calendarWeekNumbering: CalendarWeekNumbering.Default
		});
		assert.equal(this.oConfig.getCalendarWeekNumbering(), CalendarWeekNumbering.Default, "calendar week number changed to 'Default'");
		assert.equal(this.oConfig.getLanguage(), "en", "language should have been reset to 'en'");
		assert.equal(this.oConfig.getRTL(), false, "RTL should have changed to false");
		assert.notOk(this.oConfig.getFormatSettings().getLegacyDateFormat(), "legacy date format should have been reset");
		assert.notOk(this.oConfig.getFormatSettings().getLegacyTimeFormat(), "legacy time format should have been reset");
		assert.equal(this.oConfig.getCalendarType(), CalendarType.Gregorian, "calendar type should be 'Gregorian' again");
		assert.notOk(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should no longer contain private extension 'sapufmt'");
	});

	QUnit.test("FormatSettings#getFormatLocale - return custom locale if calendar week numbering is set", function (assert) {
		assert.equal(this.oConfig.getCalendarWeekNumbering(), CalendarWeekNumbering.Default);
		assert.notOk(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()),
			"format locale must not contain private extension 'sapufmt' if calendar week numbering is set to 'Default'");

		this.oConfig.setCalendarWeekNumbering(CalendarWeekNumbering.ISO_8601);

		//code under test
		assert.ok(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()),
			"format locale must contain private extension 'sapufmt' is something other than 'Default'");
	});

	QUnit.module("SAP Logon Language");

	QUnit.test("derived from language - simple", function(assert) {
		var oConfig = Core.getConfiguration();
		// SAP language derived by UI5 - simple
		oConfig.setLanguage("en-US");
		assert.equal(oConfig.getSAPLogonLanguage(), "EN", "SAP Logon language should be 'EN'");
		oConfig.setLanguage("de-CH");
		assert.equal(oConfig.getSAPLogonLanguage(), "DE", "SAP Logon language should be 'DE'");
	});

	QUnit.test("derived from language - special cases", function(assert) {
		var oConfig = Core.getConfiguration();
		//  SAP language derived by UI5 - special cases
		oConfig.setLanguage("zh-CN");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZH", "SAP Logon language should be 'ZH'");
		assert.equal(oConfig.getLanguageTag(), "zh-CN", "Language Tag should be 'zh-CN'");
		oConfig.setLanguage("zh-Hans");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZH", "SAP Logon language should be 'ZH'");
		assert.equal(oConfig.getLanguageTag(), "zh-Hans", "Language Tag should be 'zh-Hans'");
		oConfig.setLanguage("zh-Hans-CN");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZH", "SAP Logon language should be 'ZH'");
		assert.equal(oConfig.getLanguageTag(), "zh-Hans-CN", "Language Tag should be 'zh-Hans-CN'");
		oConfig.setLanguage("zh-TW");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZF", "SAP Logon language should be 'ZF'");
		assert.equal(oConfig.getLanguageTag(), "zh-TW", "Language Tag should be 'zh-TW'");
		oConfig.setLanguage("zh-Hant");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZF", "SAP Logon language should be 'ZF'");
		assert.equal(oConfig.getLanguageTag(), "zh-Hant", "Language Tag should be 'zh-Hant'");
		oConfig.setLanguage("zh-Hant-TW");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZF", "SAP Logon language should be 'ZF'");
		assert.equal(oConfig.getLanguageTag(), "zh-Hant-TW", "Language Tag should be 'zh-Hant-TW'");
		oConfig.setLanguage("en-US-x-saptrc");
		assert.equal(oConfig.getSAPLogonLanguage(), "1Q", "SAP Logon language should be '1Q'");
		assert.equal(oConfig.getLanguageTag(), "en-US-x-saptrc", "Language Tag should be 'en-US-x-saptrc'");
		oConfig.setLanguage("en-US-x-sappsd");
		assert.equal(oConfig.getSAPLogonLanguage(), "2Q", "SAP Logon language should be '2Q'");
		assert.equal(oConfig.getLanguageTag(), "en-US-x-sappsd", "Language Tag should be 'en-US-x-sappsd'");
		oConfig.setLanguage("en-US-x-saprigi");
		assert.equal(oConfig.getSAPLogonLanguage(), "3Q", "SAP Logon language should be '3Q'");
		assert.equal(oConfig.getLanguageTag(), "en-US-x-saprigi", "Language Tag should be 'en-US-x-saprigi'");
		oConfig.setLanguage("en-GB");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "SAP Logon language should be '6N'");
		assert.equal(oConfig.getLanguageTag(), "en-GB", "Language Tag should be 'en-GB'");
		oConfig.setLanguage("pt-PT");
		assert.equal(oConfig.getSAPLogonLanguage(), "1P", "SAP Logon language should be '1P'");
		assert.equal(oConfig.getLanguageTag(), "pt-PT", "Language Tag should be 'pt-PT'");

		oConfig.setLanguage("sr-Latn");
		assert.equal(oConfig.getSAPLogonLanguage(), "SH", "SAP Logon language should be 'SH'");
		assert.equal(oConfig.getLanguageTag(), "sh", "Language Tag should be 'sh'");

		oConfig.setLanguage("sh");
		assert.equal(oConfig.getSAPLogonLanguage(), "SH", "SAP Logon language should be 'SH'");
		assert.equal(oConfig.getLanguageTag(), "sh", "Language Tag should be 'sh'");

		oConfig.setLanguage("sr");
		assert.equal(oConfig.getSAPLogonLanguage(), "SR", "SAP Logon language should be 'SR'");
		assert.equal(oConfig.getLanguageTag(), "sr", "Language Tag should be 'sr'");

		oConfig.setLanguage("iw");
		assert.equal(oConfig.getSAPLogonLanguage(), "HE", "SAP Logon language should be 'HE'");
		assert.equal(oConfig.getLanguageTag(), "he", "Language Tag should be 'he'");

		oConfig.setLanguage("ji");
		assert.equal(oConfig.getSAPLogonLanguage(), "YI", "SAP Logon language should be 'YI'");
		assert.equal(oConfig.getLanguageTag(), "yi", "Language Tag should be 'yi'");
	});

	QUnit.test("configured via API", function(assert) {
		var oConfig = Core.getConfiguration();
		//  SAP language provided by caller of setLanguage
		oConfig.setLanguage("en-GB");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "setting only BCP47 language can only return 'EN'");
		oConfig.setLanguage("en-GB", "1E"); // note: only SAPLanguage changes!
		assert.equal(oConfig.getSAPLogonLanguage(), "1E", "setting both values must return the expected SAP Language '6N'");
		oConfig.setLanguage("en-GB", "6N"); // note: only SAPLanguage changes!
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "setting both values must return the expected SAP Language '6N'");
		oConfig.setLanguage("en-GB");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "setting only BCP47 language again must reset the knowledge about SAP Language");
	});

	QUnit.module("Format settings", {
		afterEach: function() {
			browserUrl.reset();
		}
	});

	QUnit.test("Read 'sap-ui-legacy-number-format' from URL", function(assert) {
		var oStub;
		[
			{ param: '', expected: undefined },
			{ param: ' ', expected: ' ' },
			{ param: 'X', expected: 'X' },
			{ param: 'x', expected: 'X' },
			{ param: 'Y', expected: 'Y' },
			{ param: 'y', expected: 'Y' }
		].forEach(function (data) {
			// setup
			BaseConfig._.invalidate();
			oStub?.restore();
			oStub = sinon.stub(URLConfigurationProvider, "get");
			oStub.callsFake(function(sKey) {
				if (sKey === "sapUiLegacyNumberFormat") {
					return data.param;
				} else {
					return oStub.wrappedMethod.call(this, sKey);
				}
			}.bind(this));

			// verify results
			assert.equal(Configuration.getFormatSettings().getLegacyNumberFormat(), data.expected, "Value of number format must be '" + data.expected + "'.");
		}.bind(this));
		oStub.restore();
	});

	QUnit.test("Read 'sap-ui-legacy-date-format' from URL", function(assert) {
		var oStub, oBaseStub;
		[
			{ param: '', expected: undefined },
			{ param: '1', expected: '1' },
			{ param: '2', expected: '2' },
			{ param: '3', expected: '3' },
			{ param: '4', expected: '4' },
			{ param: '5', expected: '5' },
			{ param: '6', expected: '6' },
			{ param: '7', expected: '7' },
			{ param: '8', expected: '8' },
			{ param: '9', expected: '9' },
			{ param: 'A', expected: 'A' },
			{ param: 'B', expected: 'B' },
			{ param: 'C', expected: 'C' },
			{ param: 'a', expected: 'A' },
			{ param: 'b', expected: 'B' },
			{ param: 'c', expected: 'C' }
		].forEach(function (data) {
			// setup
			BaseConfig._.invalidate();
			oStub?.restore();
			oStub = sinon.stub(URLConfigurationProvider, "get");
			oStub.callsFake(function(sKey) {
				if (sKey === "sapUiLegacyDateFormat") {
					return data.param;
				} else {
					return oStub.wrappedMethod.call(this, sKey);
				}
			}.bind(this));
			//reset memory Provider
			oBaseStub?.restore();
			oBaseStub = sinon.stub(BaseConfig, "get");
			oBaseStub.callsFake(function(mParameters) {
				mParameters.provider = undefined;
				return oBaseStub.wrappedMethod.call(this, mParameters);
			}.bind(this));

			assert.equal(Configuration.getFormatSettings().getLegacyDateFormat(), data.expected, "Value of date format must be '" + data.expected + "'.");
		});
		oStub.restore();
		oBaseStub.restore();
	});

	QUnit.test("Read 'sap-ui-legacy-time-format' from URL", function(assert) {
		var oStub, oBaseStub;

		[
			{ param: '', expected: undefined },
			{ param: '0', expected: '0' },
			{ param: '1', expected: '1' },
			{ param: '2', expected: '2' },
			{ param: '3', expected: '3' },
			{ param: '4', expected: '4' }
		].forEach(function (data) {
			// setup
			BaseConfig._.invalidate();
			oStub?.restore();
			oStub = sinon.stub(URLConfigurationProvider, "get");
			oStub.callsFake(function(key) {
				if (key === "sapUiLegacyTimeFormat") {
					return data.param;
				} else {
					return oStub.wrappedMethod.call(this, key);
				}
			}.bind(this));
			//reset memory Provider
			oBaseStub?.restore();
			oBaseStub = sinon.stub(BaseConfig, "get");
			oBaseStub.callsFake(function(mParameters) {
				mParameters.provider = undefined;
				return oBaseStub.wrappedMethod.call(this, mParameters);
			}.bind(this));

			assert.equal(Configuration.getFormatSettings().getLegacyTimeFormat(), data.expected, "Value of time format must be '" + data.expected + "'.");
		});
		oStub.restore();
		oBaseStub.restore();
	});

	QUnit.module("CalendarWeekNumbering");

	QUnit.test("Read calendarWeekNumbering from URL", function(assert) {
		// setup
		BaseConfig._.invalidate();
		var	oStub = sinon.stub(URLConfigurationProvider, "get");
		oStub.callsFake(function(key) {
			if (key === "sapUiCalendarWeekNumbering") {
				return "ISO_8601";
			} else {
				return oStub.wrappedMethod.call(this, key);
			}
		}.bind(this));
		//reset memory Provider
		var oBaseStub = sinon.stub(BaseConfig, "get");
		oBaseStub.callsFake(function(mParameters) {
			mParameters.provider = undefined;
			return oBaseStub.wrappedMethod.call(this, mParameters);
		}.bind(this));

		// verify results
		assert.equal(Configuration.getCalendarWeekNumbering(), CalendarWeekNumbering.ISO_8601,
			'calendarWeekNumbering set via URL');
		oStub.restore();
		oBaseStub.restore();
	});

	QUnit.test("Read calendarWeekNumbering from URL - empty string leads to default value", function(assert) {
		// setup
		BaseConfig._.invalidate();
		var	oStub = sinon.stub(URLConfigurationProvider, "get");
		oStub.callsFake(function(key) {
			if (key === "sapUiCalendarWeekNumbering") {
				return "";
			} else {
				return oStub.wrappedMethod.call(this, key);
			}
		}.bind(this));
		//reset memory Provider
		var oBaseStub = sinon.stub(BaseConfig, "get");
		oBaseStub.callsFake(function(mParameters) {
			mParameters.provider = undefined;
			return oBaseStub.wrappedMethod.call(this, mParameters);
		}.bind(this));

		// verify results
		assert.equal(Configuration.getCalendarWeekNumbering(), CalendarWeekNumbering.Default,
			'no value in URL leads to default value');
		oStub.restore();
		oBaseStub.restore();
	});

	QUnit.test("Read calendarWeekNumbering from URL - invalid value", function(assert) {
		assert.throws(function() {
			Configuration.setCalendarWeekNumbering("invalid");
		}, new TypeError("Unsupported Enumeration value for calendarWeekNumbering, valid values are: "
				+ "Default, ISO_8601, MiddleEastern, WesternTraditional"));
	});

	QUnit.module("Timezone", {
		beforeEach: function(assert) {
			Configuration.setLanguage("en");
			BaseConfig._.invalidate();
		}
	});

	QUnit.test("Read timezone from URL", function(assert) {
		// setup
		var oStub = sinon.stub(BaseConfig, "get");
		oStub.callsFake(function(mParameters) {
			if (mParameters.name === "sapUiTimezone") {
				return "America/Los_Angeles";
			} else {
				return oStub.wrappedMethod.call(this, mParameters);
			}
		});

		// verify results
		assert.equal(Configuration.getTimezone(), 'America/Los_Angeles', 'America/Los_Angeles is set');
		oStub.restore();
	});

	QUnit.test("Read timezone from URL sap-timezone", function(assert) {
		var oStub = sinon.stub(BaseConfig, "get");
		oStub.callsFake(function(mParameters) {
			if (mParameters.name === "sapTimezone") {
				return "America/Los_Angeles";
			} else {
				return oStub.wrappedMethod.call(this, mParameters);
			}
		});

		// verify results
		assert.equal(Configuration.getTimezone(), 'America/Los_Angeles', 'America/Los_Angeles is set');
		oStub.restore();
	});

	QUnit.test("Read timezone from URL: invalid", function(assert) {
		// setup
		var oStub = sinon.stub(BaseConfig, "get");
		oStub.callsFake(function(mParameters) {
			if (mParameters.name === "sapUiTimezone") {
				return "invalid";
			} else {
				return oStub.wrappedMethod.call(this, mParameters);
			}
		});

		// verify results
		assert.equal(Configuration.getTimezone(), sLocalTimezone, "fallback to '" + sLocalTimezone + "'");
		oStub.restore();
	});

	/**
	 * Tests the interaction between the legacy "animation" and the modern "animationMode" settings.
	 * If only the legacy "animation" settings is given, the modern "animationMode" settings is
	 * automatically set accordingly.
	 * @deprecated As of version 1.110
	 */
	QUnit.module("[Legacy] Animation & AnimationMode interaction", {
		beforeEach: function() {
			this.mParams = {};
			BaseConfig._.invalidate();
			this.oGlobalConfigStub = sinon.stub(GlobalConfigurationProvider, "get");
			this.oGlobalConfigStub.callsFake(function(sKey) {
				if (this.mParams[sKey] !== undefined) {
					return this.mParams[sKey];
				} else {
					return this.oGlobalConfigStub.wrappedMethod.call(this, sKey);
				}
			}.bind(this));
			this.oBaseStub = sinon.stub(BaseConfig, "get");
			this.oBaseStub.callsFake(function(mParameters) {
				mParameters.provider = undefined;
				return this.oBaseStub.wrappedMethod.call(this, mParameters);
			}.bind(this));
		},
		afterEach: function() {
			this.oGlobalConfigStub.restore();
			this.oBaseStub.restore();
		}
	});

	QUnit.test("Default animation and animation mode", function(assert) {
		assert.ok(Configuration.getAnimation(), "Default animation.");
		assert.equal(Configuration.getAnimationMode(), AnimationMode.full, "Default animation mode.");
	});

	QUnit.test("Animation is off, default animation mode", function(assert) {
		this.mParams.sapUiAnimation = false;
		this.mParams.sapUiAnimationMode = undefined;
		assert.ok(!Configuration.getAnimation(), "Animation should be off.");
		assert.equal(Configuration.getAnimationMode(), AnimationMode.minimal, "Animation mode should switch to " + AnimationMode.minimal + ".");
	});

	QUnit.test("Animation is off, valid but not possible mode is set and sanitized", function(assert) {
		this.mParams.sapUiAnimation = false;
		this.mParams.sapUiAnimationMode = AnimationMode.basic;
		assert.ok(Configuration.getAnimation(), "Animation should be on because animation mode overwrites animation.");
		assert.equal(Configuration.getAnimationMode(), AnimationMode.basic, "Animation mode should switch to " + AnimationMode.basic + ".");
	});

	QUnit.test("Valid animation modes from enumeration & side-effect on 'animation' setting", function(assert) {
		for (var sAnimationModeKey in AnimationMode) {
			if (AnimationMode.hasOwnProperty(sAnimationModeKey)) {
				BaseConfig._.invalidate();
				var sAnimationMode = AnimationMode[sAnimationModeKey];
				this.mParams.sapUiAnimation = false;
				this.mParams.sapUiAnimationMode = sAnimationMode;
				if (sAnimationMode === AnimationMode.none || sAnimationMode === AnimationMode.minimal) {
					assert.ok(!Configuration.getAnimation(), "Animation is switched to off because of animation mode.");
				} else {
					assert.ok(Configuration.getAnimation(), "Animation is switched to on because of animation mode.");
				}
				assert.equal(Configuration.getAnimationMode(), sAnimationMode, "Test for animation mode: " + sAnimationMode);
			}
		}
	});

	QUnit.module("AnimationMode initial setting evaluation", {
		beforeEach: function() {
			this.mParams = {};
			BaseConfig._.invalidate();
			this.oGlobalConfigStub = sinon.stub(GlobalConfigurationProvider, "get");
			this.oGlobalConfigStub.callsFake(function(sKey) {
				if (this.mParams[sKey] !== undefined) {
					return this.mParams[sKey];
				} else {
					return this.oGlobalConfigStub.wrappedMethod.call(this, sKey);
				}
			}.bind(this));
			this.oBaseStub = sinon.stub(BaseConfig, "get");
			this.oBaseStub.callsFake(function(mParameters) {
				mParameters.provider = undefined;
				return this.oBaseStub.wrappedMethod.call(this, mParameters);
			}.bind(this));
		},
		afterEach: function() {
			this.oGlobalConfigStub.restore();
			this.oBaseStub.restore();
		}
	});

	QUnit.test("Invalid animation mode", function(assert) {
		/**
		 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
		 */
		this.mParams.sapUiAnimation = false;
		this.mParams.sapUiAnimationMode = "someuUnsupportedStringValue";
		assert.throws(
			function() { Configuration.getAnimationMode(); },
			new TypeError("Unsupported Enumeration value for sapUiAnimationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);
	});

	QUnit.test("Valid animation modes from enumeration", function(assert) {
		for (var sAnimationModeKey in AnimationMode) {
			if (AnimationMode.hasOwnProperty(sAnimationModeKey)) {
				BaseConfig._.invalidate();
				var sAnimationMode = AnimationMode[sAnimationModeKey];
				/**
				 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
				 */
				this.mParams.sapUiAnimation = false;
				this.mParams.sapUiAnimationMode = sAnimationMode;
				assert.equal(Configuration.getAnimationMode(), sAnimationMode, "Test for animation mode: " + sAnimationMode);
			}
		}
	});

	QUnit.module("AnimationMode changes at runtime", {
		before: function () {
			this.getConfiguration = function () {
				return Configuration;
			};
		},
		beforeEach: function() {
			// Restore default animation mode
			Configuration.setAnimationMode(AnimationMode.full);
		},
		afterEach: function() {
			Configuration.setAnimationMode(AnimationMode.minimal);
		}
	});

	QUnit.test("Set animation mode to a valid value", function(assert) {
		var oConfiguration = this.getConfiguration();

		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.full, "Default animation mode is " + AnimationMode.full + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full);

		oConfiguration.setAnimationMode(AnimationMode.basic);
		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.basic, "Animation mode should switch to " + AnimationMode.basic + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.basic);
	});

	QUnit.test("Set animation mode to " + AnimationMode.none + " to turn animation off", function(assert) {
		var oConfiguration = this.getConfiguration();

		// Check if default values are set
		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.full, "Default animation mode is " + AnimationMode.full + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full, "Default animation mode should be injected as attribute.");
		/**
		 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
		 */
		assert.equal(getHtmlAttribute("data-sap-ui-animation"), "on", "Default animation should be injected as attribute.");

		// Change animation mode
		oConfiguration.setAnimationMode(AnimationMode.none);
		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.none, "Animation mode should switch to " + AnimationMode.none + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.none, "Animation mode should be injected as attribute.");
		/**
		 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
		 */
		assert.equal(getHtmlAttribute("data-sap-ui-animation"), "off", "Animation should be turned off.");
	});

	QUnit.test("Invalid animation mode", function(assert) {
		var oConfiguration = this.getConfiguration();

		assert.throws(
			function() { oConfiguration.setAnimationMode("someUnsupportedStringValue"); },
			new TypeError("Unsupported Enumeration value for animationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);

		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full, "Default animation mode should stay the same.");
	});

	QUnit.module("Flexibility Services & Connectors");

	QUnit.test("Get the Flexibility Services", function(assert) {
		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, [{connector: "LrepConnector", url: "/sap/bc/lrep"}]);
	});

	QUnit.test("Get the Flexibility Services - set to an empty string", function(assert) {
		BaseConfig._.invalidate();
		var oStub = sinon.stub(GlobalConfigurationProvider, "get");
		oStub.callsFake(function(sKey) {
			if (sKey === "sapUiFlexibilityServices") {
				return "";
			} else {
				return oStub.wrappedMethod.call(this, sKey);
			}
		}.bind(this));
		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, []);
		oStub.restore();
	});

	QUnit.test("Get the Flexibility Services - set to an empty array", function(assert) {
		BaseConfig._.invalidate();
		var oStub = sinon.stub(GlobalConfigurationProvider, "get");
		oStub.callsFake(function(sKey) {
			if (sKey === "sapUiFlexibilityServices") {
				return "[]";
			} else {
				return oStub.wrappedMethod.call(this, sKey);
			}
		}.bind(this));
		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, []);
		oStub.restore();
	});

	QUnit.test("Get the Flexibility Services - set to multiple objects", function(assert) {
		BaseConfig._.invalidate();
		var oFirstConfigObject = {'layers': ['CUSTOMER'], 'connector': 'KeyUserConnector', 'url': '/flex/keyUser'};
		var oSecondConfigObject = {'layers': ['USER'], 'connector': 'PersonalizationConnector', 'url': '/sap/bc/lrep'};
		var aConfig = [oFirstConfigObject, oSecondConfigObject];
		var sConfigString = JSON.stringify(aConfig);

		var oStub = sinon.stub(GlobalConfigurationProvider, "get");
		oStub.callsFake(function(sKey) {
			if (sKey === "sapUiFlexibilityServices") {
				return sConfigString;
			} else {
				return oStub.wrappedMethod.call(this, sKey);
			}
		}.bind(this));

		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, aConfig);
		oStub.restore();
	});

	QUnit.module("ThemeRoot Validation");

	// determine the default port depending on the protocol of the current page
	const defaultPort = window.location.protocol === "https:" ? 443 : 80;
	const origin = window.location.origin;
	const originWithoutProtocol = origin.replace(window.location.protocol, "");

	[
		{
			caption: "Relative URL, All Origins",
			theme: "custom@custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: "custom-theme/UI5/"
		},
		{
			caption: "Relative URL, no valid origins",
			theme: "custom@custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: "custom-theme/UI5/"
		},
		{
			caption: "Relative URL, baseURI on different domain, no valid origins",
			theme: "custom@custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: "custom-theme/UI5/",
			baseURI: "http://example.org" //Check why needed
		},
		{
			caption: "Relative URL, baseURI on different domain, All origins",
			theme: "custom@custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: "custom-theme/UI5/",
			baseURI: "http://example.org" //Check why needed
		},
		{
			caption: "Relative URL, relative baseURI",
			theme: "custom@../custom-theme",
			allowedOrigins: null,
			expectedThemeRoot: "../custom-theme/UI5/",
			baseURI: "/some/other/path/" //Check why needed
		},
		{
			caption: "Absolute URL, All Origins",
			theme: "custom@ftp://example.org/theming/custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: "ftp://example.org/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, Same Domain",
			theme: `custom@${origin}/theming/custom-theme/`,
			allowedOrigins: origin,
			expectedThemeRoot: "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, Valid, but Different Domain",
			theme: "custom@https://example.com/theming/custom-theme/",
			allowedOrigins: "https://example.com",
			expectedThemeRoot: "https://example.com/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, no valid origins",
			theme: "custom@https://example.com/theming/custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, empty valid origins",
			theme: "custom@https://example.com/theming/custom-theme/",
			allowedOrigins: "",
			expectedThemeRoot: "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL with same protocol, Valid",
			theme: "custom@//example.com/theming/custom-theme/",
			allowedOrigins: "example.com",
			expectedThemeRoot: "//example.com/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and themeRoot has default port, Valid",
			theme: `custom@//example.com:${defaultPort}/theming/custom-theme/`,
			allowedOrigins: "example.com",
			expectedThemeRoot: "//example.com/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and allowedThemeOrigin has default port, Valid",
			theme: "custom@//example.com/theming/custom-theme/",
			allowedOrigins: `example.com:${defaultPort}`,
			expectedThemeRoot: "//example.com/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and custom port, Valid",
			theme: "custom@//example.com:8080/theming/custom-theme/",
			allowedOrigins: "example.com:8080",
			expectedThemeRoot: "//example.com:8080/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and themeRoot has custom port, not valid",
			theme: "custom@//example.com:8080/theming/custom-theme/",
			allowedOrigins: "example.com",
			expectedThemeRoot: `${originWithoutProtocol}/theming/custom-theme/UI5/`,
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and allowedThemeOrigin has custom port, not valid",
			theme: "custom@//example.com/theming/custom-theme/",
			allowedOrigins: "example.com:8080",
			expectedThemeRoot: `${originWithoutProtocol}/theming/custom-theme/UI5/`,
			noProtocol: true
		}
	].forEach(function(oSetup) {
		QUnit.test(oSetup.caption, function(assert) {
			BaseConfig._.invalidate();
			var oStub = sinon.stub(BaseConfig, "get");
			oStub.callsFake(function(mParameters) {
				switch (mParameters.name) {
					case "sapAllowedThemeOrigins":
						return oSetup.allowedOrigins;
					case "sapUiTheme":
						return oSetup.theme;
					default:
						return oStub.wrappedMethod.call(this, mParameters);
				}
			});
			assert.equal(Configuration.getTheme(), "custom", "Configuration 'getTheme' returns expected 'theme' " + Configuration.getTheme());
			assert.equal(Theming.getThemeRoot(), oSetup.noProtocol ? oSetup.expectedThemeRoot : new URL(oSetup.expectedThemeRoot, location.href).toString(),
				"Theming 'getThemeRoot' returns expected 'themeRoot' " + Theming.getThemeRoot());
			oStub.restore();
		});
	});

	QUnit.module("Allowlist configuration options", {
		beforeEach: function() {
			BaseConfig._.invalidate();
			this.oStub = sinon.stub(BaseConfig, "get");
			this.oStub.callsFake((oParams) =>
				(mConfigStubValues.hasOwnProperty(oParams.name) ? mConfigStubValues[oParams.name] : this.oStub.wrappedMethod.call(this, oParams))
			);
		},
		afterEach: function() {
			mConfigStubValues = {};
			this.oStub.restore();
		}
	});

	// Whitelist service only
	// SAP strives to replace insensitive terms with inclusive language.
	// Since APIs cannot be renamed or immediately removed for compatibility reasons, this API has been deprecated.
	/**
	 * @deprecated Since 1.85.0.
	 */
	QUnit.test("whitelistService", function(assert) {
		var SERVICE_URL = "/service/url/from/config";
		mConfigStubValues["sapUiWhitelistService"] = SERVICE_URL;
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	// AllowList Service only
	QUnit.test("allowlistService", function(assert) {
		var SERVICE_URL = "/service/url/from/config";
		mConfigStubValues["sapUiAllowlistService"] = SERVICE_URL;

		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
		/**
		 * @deprecated Since 1.85.0.
		 */
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
	});

	// AllowList mixed with WhiteList Service (AllowList should be preferred)
	// SAP strives to replace insensitive terms with inclusive language.
	// Since APIs cannot be renamed or immediately removed for compatibility reasons, this API has been deprecated.
	/**
	 * @deprecated Since 1.85.0.
	 */
	QUnit.test("whitelistService mixed with allowlistService", function(assert) {
		var SERVICE_URL = "/service/url/from/config";
		mConfigStubValues["sapUiWhitelistService"] = SERVICE_URL;
		mConfigStubValues["sapUiAllowlistService"] = SERVICE_URL;

		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.module("OData V4", {
		beforeEach: function() {
			BaseConfig._.invalidate();
			this.oStub = sinon.stub(GlobalConfigurationProvider, "get");
			this.oStub.callsFake((sKey) =>
				(mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : this.oStub.wrappedMethod.call(this, sKey))
			);
		},
		afterEach: function() {
			mConfigStubValues = {};
			this.oStub.restore();
		}
	});

	QUnit.test("securityTokenHandlers", function(assert) {
		var fnSecurityTokenHandler1 = function () {},
			fnSecurityTokenHandler2 = function () {};
		BaseConfig._.invalidate();

		// code under test
		assert.deepEqual(Configuration.getSecurityTokenHandlers(), []);

		// bootstrap does some magic and converts to lower case, test does not :-(
		mConfigStubValues["sapUiSecurityTokenHandlers"] = [];
		BaseConfig._.invalidate();

		// code under test
		assert.strictEqual(Configuration.getSecurityTokenHandlers().length, 0, "check length");

		mConfigStubValues["sapUiSecurityTokenHandlers"] = [fnSecurityTokenHandler1];
		BaseConfig._.invalidate();

		// code under test
		assert.strictEqual(Configuration.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1, "check Fn");
		assert.strictEqual(Configuration.getSecurityTokenHandlers().length, 1, "check length");

		mConfigStubValues["sapUiSecurityTokenHandlers"]
			= [fnSecurityTokenHandler1, fnSecurityTokenHandler2];
		BaseConfig._.invalidate();

		// code under test
		assert.strictEqual(Configuration.getSecurityTokenHandlers().length, 2, "check length");
		assert.strictEqual(Configuration.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1, "check Fn");
		assert.strictEqual(Configuration.getSecurityTokenHandlers()[1], fnSecurityTokenHandler2, "check Fn");

		mConfigStubValues["sapUiSecurityTokenHandlers"] = fnSecurityTokenHandler1;
		BaseConfig._.invalidate();

		assert.throws(function () {
			// code under test
			Configuration.getSecurityTokenHandlers();
		}); // aSecurityTokenHandlers.forEach is not a function

		mConfigStubValues["sapUiSecurityTokenHandlers"] = [fnSecurityTokenHandler1, "foo"];
		BaseConfig._.invalidate();

		assert.throws(function () {
			// code under test
			Configuration.getSecurityTokenHandlers();
		}, "Not a function: foo");

		// code under test
		Configuration.setSecurityTokenHandlers([fnSecurityTokenHandler1]);

		assert.notStrictEqual([fnSecurityTokenHandler1], Configuration.securityTokenHandlers);
		assert.notStrictEqual(Configuration.getSecurityTokenHandlers(), Configuration.securityTokenHandlers);
		assert.strictEqual(Configuration.getSecurityTokenHandlers().length, 1);
		assert.strictEqual(Configuration.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1);

		assert.throws(function () {
			// code under test
			Configuration.setSecurityTokenHandlers([fnSecurityTokenHandler1, "foo"]);
		}, "Not a function: foo");

		assert.throws(function () {
			// code under test
			Configuration.setSecurityTokenHandlers([undefined]);
		}, "Not a function: undefined");

		assert.throws(function () {
			// code under test
			Configuration.setSecurityTokenHandlers("foo");
		}); // aSecurityTokenHandlers.forEach is not a function

		// code under test
		Configuration.setSecurityTokenHandlers([fnSecurityTokenHandler1, fnSecurityTokenHandler2]);

		assert.strictEqual(Configuration.getSecurityTokenHandlers().length, 2);
		assert.strictEqual(Configuration.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1);
		assert.strictEqual(Configuration.getSecurityTokenHandlers()[1], fnSecurityTokenHandler2);

		// code under test
		Configuration.setSecurityTokenHandlers([]);

		assert.deepEqual(Configuration.getSecurityTokenHandlers(), []);
	});
});
