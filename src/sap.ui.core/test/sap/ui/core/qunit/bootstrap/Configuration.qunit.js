/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/core/CalendarType',
	'sap/ui/core/Configuration',
	'sap/ui/core/Core',
	'sap/ui/core/format/TimezoneUtil',
	'sap/ui/core/Locale',
	'sap/base/Log',
	'../routing/HistoryUtils',
	'sap/ui/base/Interface',
	'sap/ui/core/LocaleData' // only used indirectly via Configuration.getCalendarType
], function(CalendarType, Configuration, Core, TimezoneUtil, Locale, Log, HistoryUtils, Interface/*, LocaleData*/) {
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

	var sLocalTimezone = TimezoneUtil.getLocalTimezone();

	function getHtmlAttribute(sAttribute) {
		return document.documentElement.getAttribute(sAttribute);
	}

	// used to get access to the non-public core parts
	var oRealCore;
	var TestCorePlugin = function() {};
	TestCorePlugin.prototype.startPlugin = function(oCore, bOnInit) {
		oRealCore = oCore;
	};
	sap.ui.getCore().registerPlugin(new TestCorePlugin());

	// Initialize the HistoryUtils
	QUnit.begin(HistoryUtils.init);

	// Resets the HistoryUtils
	QUnit.done(HistoryUtils.exit);

	QUnit.module("Basic");

	QUnit.test("Constructor", function(assert) {
		var oLogSpy = sinon.spy(Log, "error");
		var oConfiguration1 = new Configuration();
		var oConfiguration2 = new Configuration();
		var sExpectedErrorText = "Configuration is designed as a singleton and should not be created manually! " +
			"Please require 'sap/ui/core/Configuration' instead and use the module export directly without using 'new'.";

		assert.strictEqual(oConfiguration1, oConfiguration2, "Constructor of configuration should always return the same instance.");
		assert.ok(oLogSpy.calledTwice, "There should be two errors logged for each constructor call.");
		assert.strictEqual(oLogSpy.getCall(0).args[0], sExpectedErrorText, "Correct error logged");
		assert.strictEqual(oLogSpy.getCall(1).args[0], sExpectedErrorText, "Correct error logged");

		oLogSpy.restore();
	});

	QUnit.test("Settings", function(assert) {
		assert.equal(Configuration.getTheme(), "SapSampleTheme2", "tag config should override global config");
		assert.deepEqual(Configuration.getValue("modules"), ["sap.ui.core.library"], "Module List in configuration matches configured modules/libraries");
	});

	QUnit.test("jQuery and $", function(assert) {
		// we configured noConflict=true, so $ shouldn't be the same as jQuery
		assert.ok(window.jQuery, "window.jQuery is available");
		assert.ok(!window.$ || window.$ !== window.jQuery, "window.$ not available or not the same as jQuery");
	});

	QUnit.test("LegacyDateCalendarCustomizing", function(assert) {
		var oCfg = new Configuration(),
			oFormatSettings = oCfg.getFormatSettings();

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
		var oCfg = new Configuration(),
			oFormatSettings = oCfg.getFormatSettings();

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
			window['sap-ui-config'] = {
				language: 'en'
			};
			Configuration.setCore(this.oCoreMock);
			this.oConfig = Configuration;
		}
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

	// TODO Timezone Configuration: Unskip when re-enabling Configuration#setTimezone functionality
	QUnit.skip("setTimezone('America/New_York') - simple", function(assert) {
		var sDifferentTimezone = sLocalTimezone === "Europe/Berlin" ? "America/New_York" : "Europe/Berlin";
		this.oConfig.setTimezone(sDifferentTimezone);
		assert.equal(this.oConfig.getTimezone(), sDifferentTimezone, "timezone should be '" + sDifferentTimezone + "'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]), ['timezone'], "event should have reported 'timezone' as changed");
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
			calendarType: 'Islamic'
		});
		assert.equal(this.oConfig.getLanguage(), "he", "language should have changed to 'he'");
		assert.equal(this.oConfig.getRTL(), true, "RTL should have changed to true");
		assert.equal(this.oConfig.getFormatSettings().getLegacyDateFormat(), "1", "legacy date format should have changed to '1'");
		assert.equal(this.oConfig.getFormatSettings().getLegacyTimeFormat(), "1", "legacy time format should have changed to '1'");
		assert.ok(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should contain private extension 'sapufmt'");
		assert.equal(this.eventsReceived, 1, "one localizationChange event should have been fired");
		assert.deepEqual(Object.keys(this.changes[0]).sort(), [
			'calendarType',
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
			calendarType: null
		});
		assert.equal(this.oConfig.getLanguage(), "en", "language should have been reset to 'en'");
		assert.equal(this.oConfig.getRTL(), false, "RTL should have changed to false");
		assert.notOk(this.oConfig.getFormatSettings().getLegacyDateFormat(), "legacy date format should have been reset");
		assert.notOk(this.oConfig.getFormatSettings().getLegacyTimeFormat(), "legacy time format should have been reset");
		assert.equal(this.oConfig.getCalendarType(), CalendarType.Gregorian, "calendar type should be 'Gregorian' again");
		assert.notOk(/-x-(.*-)?sapufmt/.test(this.oConfig.getFormatSettings().getFormatLocale().toString()), "format locale should no longer contain private extension 'sapufmt'");
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
		assert.equal(oConfig.getLanguageTag(), "sh", "Language Tag should be 'sr-Latn'");

		oConfig.setLanguage("sh");
		assert.equal(oConfig.getSAPLogonLanguage(), "SH", "SAP Logon language should be 'SH'");
		assert.equal(oConfig.getLanguageTag(), "sh", "Language Tag should be 'sr-Latn'");

		oConfig.setLanguage("sr");
		assert.equal(oConfig.getSAPLogonLanguage(), "SR", "SAP Logon language should be 'SR'");
		assert.equal(oConfig.getLanguageTag(), "sr", "Language Tag should be 'sr'");
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

	QUnit.module("SAP Logon Language (via url)", {
		beforeEach: function(assert) {
			this.setupConfig = function(sLanguage, sUrl) {
				var oCoreMock = {
					fireLocalizationChanged: function() {}
				};
				window["sap-ui-config"] = window["sap-ui-config"] || {};
				window["sap-ui-config"].language = sLanguage;
				browserUrl.change(sUrl);
				// reset sapLogonLanguage
				Configuration.setLanguage("xx", undefined);
				Configuration.setCore(oCoreMock);
				return Configuration;
			};
		},
		afterEach: function() {
			browserUrl.reset();
		}
	});

	[
		/* URL parameter							language			languageTag 		SAP-L	Caption */
		[ "?sap-language=en",						"en",				"en",				"EN",	"sap-language is the valid ISO language EN"],
		[ "?sap-language=EN",						"EN",				"en",				"EN",	"sap-language is the valid ISO language EN"],
		[ "?sap-language=ZH",						"zh-Hans",			"zh-Hans",			"ZH",	"sap-language is the known SAP language ZN"],
		[ "?sap-language=ZF",						"zh-Hant",			"zh-Hant",			"ZF",	"sap-language is the known SAP language ZF"],
		[ "?sap-language=1Q",						"en-US-x-saptrc",	"en-US-x-saptrc",	"1Q",	"sap-language is the known SAP language 1Q"],
		[ "?sap-language=2Q",						"en-US-x-sappsd",	"en-US-x-sappsd",	"2Q",	"sap-language is the known SAP language 2Q"],
		[ "?sap-language=3Q",						"en-US-x-saprigi",	"en-US-x-saprigi",	"3Q",	"sap-language is the known SAP language 3Q"],
		[ "?sap-language=6N",						"en-GB",			"en-GB",			"6N",	"sap-language is the unknown SAP language 6N"],
		[ "?sap-language=SH",						"sr-Latn",			"sh",		    	"SH",	"sap-language is the unknown SAP language 6N"],
		[ "?sap-locale=fr_CH",						"fr_CH",			"fr-CH",			"FR",	"sap-locale is the accepted BCP47 tag fr_CH"],
		[ "?sap-locale=En_gb&sap-language=6N",		"En_gb",			"en-GB",			"6N",	"valid combination of sap-locale and sap-language (En_gb, 6N)"],
		[ "?sap-ui-language=en_GB&sap-language=6N",	"en_GB",			"en-GB",			"6N",	"valid combination of sap-ui-language and sap-language (en_GB, 6N)"],
		[ "?sap-language=EN&sap-locale=en_GB",		"en_GB",			"en-GB",			"EN",	"valid combination of sap-language and sap-locale, both as BCP47 tag (EN, en_GB)"]
	].forEach(function( data ) {

		QUnit.test(data[4], function(assert) {

			var oConfig = this.setupConfig("de", data[0]);
			assert.equal(oConfig.getLanguage(), data[1], "the effective language should be '" + data[1] + "'");
			assert.equal(oConfig.getLanguageTag(), data[2], "the effective language tag should be '" + data[2] + "'");
			assert.equal(oConfig.getSAPLogonLanguage(), data[3], "the SAP Logon language should be '" + data[3] + "'");

		});

	});

	QUnit.test("language via url, locale+language via API", function(assert) {

		var oConfig = this.setupConfig("de", "?sap-language=6N");
		assert.equal(oConfig.getLanguage(), "en-GB", "the effective language still should be 'en-GB'");
		assert.equal(oConfig.getLanguageTag(), "en-GB", "the effective language tag still should be 'en-GB'");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N' already");

		oConfig = this.setupConfig("de", "?sap-language=1E");
		assert.equal(oConfig.getLanguage(), "de", "the effective language still should be 'de'");
		assert.equal(oConfig.getLanguageTag(), "de", "the effective language tag still should be 'de'");
		assert.equal(oConfig.getSAPLogonLanguage(), "1E", "the SAP Logon language should be '6N' already");

		// without the second parameter, the sap language now would be 'EN' only
		oConfig.setLanguage("en-GB");
		assert.equal(oConfig.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(oConfig.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "the SAP Logon language should be 'EN'");

		// but with the second parameter, everything should be fine
		oConfig.setLanguage("en-GB", "6N");
		assert.equal(oConfig.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(oConfig.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N'");

		oConfig.setLanguage("en-GB", "1E");
		assert.equal(oConfig.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(oConfig.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(oConfig.getSAPLogonLanguage(), "1E", "the SAP Logon language should be '1E'");

	});

	QUnit.test("error reporting", function(assert) {
		this.stub(Log, 'warning');
		this.setupConfig("de", "?sap-language=1E&sap-locale=en-GB");
		assert.strictEqual(Log.warning.called, false, "no warning should be written if accompanied by sap-locale");
		this.setupConfig("de", "?sap-language=1E&sap-ui-language=en-GB");
		assert.strictEqual(Log.warning.called, false, "no warning should be written if accompanied by sap-ui-language");
		this.setupConfig("de", "?sap-language=1E");
		assert.ok(Log.warning.calledWith(sinon.match(/1E/).and(sinon.match(/BCP-?47/i))), "warning must have been written");
		assert.throws(function() {
			this.setupConfig("de", "?sap-locale=1E&sap-language=1E");
		}, "setting an invalid (non-BCP-47) sap-locale should cause an error");
		assert.throws(function() {
			this.setupConfig("de", "?sap-ui-language=1E&sap-language=1E");
		}, "setting an invalid (non-BCP-47) sap-ui-language should cause an error");
	});

	QUnit.test("Format Locale", function(assert) {
		var checkPublicMethods = function (oObject, fnClass) {
			var aMethodNames = fnClass.getMetadata().getAllPublicMethods(), i;

			for ( i = 0; i < aMethodNames.length; i++ ) {
				assert.ok(oObject[aMethodNames[i]] !== undefined, "expected interface method should actually exist: " + aMethodNames[i]);
			}

			for ( i in oObject ) {
				assert.ok(aMethodNames.indexOf(i) >= 0, "actual method should be part of expected interface: " + i);
			}
		};
		var oConfig;

		window['sap-ui-config'].formatlocale = 'fr-CH'; // Note: Configuration expects sap-ui-config names converted to lowercase (done by bootstrap)
		oConfig = this.setupConfig("fr-FR", "");
		assert.equal(oConfig.getLanguageTag(), "fr-FR", "language should be fr-FR");
		assert.equal(oConfig.getFormatLocale(), "fr-CH", "format locale string should be fr-CH");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Interface, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "fr-CH", "format locale should be fr-CH");

		window['sap-ui-config'].formatlocale = null;
		oConfig = this.setupConfig("fr-FR", "");
		assert.equal(oConfig.getLanguageTag(), "fr-FR", "language should be fr-FR");
		assert.equal(oConfig.getFormatLocale(), "fr-FR", "format locale string should be fr-CH");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Interface, "format locale should exist");
		checkPublicMethods(Configuration.getFormatSettings().getFormatLocale(), Locale);
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "fr-FR", "format locale should be fr-CH");
		delete window['sap-ui-config'].formatlocale;

		oConfig = this.setupConfig("de", "?sap-language=EN&sap-ui-formatLocale=en-AU");
		assert.equal(oConfig.getLanguageTag(), "en", "language should be en");
		assert.equal(oConfig.getFormatLocale(), "en-AU", "format locale string should be en-AU");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Interface, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "en-AU", "format locale should be en-AU");

		oConfig.setFormatLocale("en-CA");
		assert.equal(oConfig.getFormatLocale(), "en-CA", "format locale string should be en-CA");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Interface, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "en-CA", "format locale should be en-CA");

		oConfig.setFormatLocale();
		assert.equal(oConfig.getFormatLocale(), "en", "format locale string should be en");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Interface, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "en", "format locale should be en");

		assert.throws(function() {
			oConfig.setFormatLocale('6N');
		}, "setting an invalid (non-BCP-47) format locale should cause an error");
		assert.throws(function() {
			oConfig.setFormatLocale(new Date());
		}, "setting a non-string value as format locale should cause an error");
	});



	QUnit.module("Format settings", {
		afterEach: function() {
			browserUrl.reset();
		}
	});

	QUnit.test("Read 'sap-ui-legacy-number-format' from URL", function(assert) {

		var oSpySetLegacyNumberFormat = this.spy(Configuration.FormatSettings.prototype, "setLegacyNumberFormat");

		[
			{ param: '', expected: undefined },
			{ param: ' ', expected: ' ' },
			{ param: 'X', expected: 'X' },
			{ param: 'x', expected: 'X' },
			{ param: 'Y', expected: 'Y' },
			{ param: 'y', expected: 'Y' }
		].forEach(function (data) {

			// setup
			browserUrl.change('?sap-ui-legacy-number-format=' + encodeURIComponent(data.param));
			oSpySetLegacyNumberFormat.resetHistory();

			// call method under test
			Configuration.setCore();

			// verify results
			assert.equal(oSpySetLegacyNumberFormat.callCount, 1, "setLegacyNumberFormat with value: '" + data.param + "' must be called");
			assert.equal(Configuration.getFormatSettings().getLegacyNumberFormat(), data.expected, "Value of number format must be '" + data.expected + "'.");
		});
	});

	QUnit.test("Read 'sap-ui-legacy-date-format' from URL", function(assert) {

		var oSpySetLegacyDateFormat = this.spy(Configuration.FormatSettings.prototype, "setLegacyDateFormat");

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

			browserUrl.change('?sap-ui-legacy-date-format=' + encodeURIComponent(data.param));
			oSpySetLegacyDateFormat.resetHistory();

			Configuration.setCore();

			assert.equal(oSpySetLegacyDateFormat.callCount, 1, "setLegacyDateFormat must have been called one time");
			assert.equal(Configuration.getFormatSettings().getLegacyDateFormat(), data.expected, "Value of date format must be '" + data.expected + "'.");
		});
	});

	QUnit.test("Read 'sap-ui-legacy-time-format' from URL", function(assert) {
		var oSpySetLegacyTimeFormat = this.spy(Configuration.FormatSettings.prototype, "setLegacyTimeFormat");

		[
			{ param: '', expected: undefined },
			{ param: '0', expected: '0' },
			{ param: '1', expected: '1' },
			{ param: '2', expected: '2' },
			{ param: '3', expected: '3' },
			{ param: '4', expected: '4' }
		].forEach(function (data) {

			browserUrl.change('?sap-ui-legacy-time-format=' + encodeURIComponent(data.param));
			oSpySetLegacyTimeFormat.resetHistory();

			Configuration.setCore();

			assert.equal(oSpySetLegacyTimeFormat.callCount, 1, "setLegacyTimeFormat must be called one time");
			assert.equal(Configuration.getFormatSettings().getLegacyTimeFormat(), data.expected, "Value of time format must be '" + data.expected + "'.");
		});
	});

	QUnit.module("Timezone", {
		beforeEach: function(assert) {
			window["sap-ui-config"].language = "en";
		},
		afterEach: function() {
			browserUrl.reset();
		}
	});

	// TODO Timezone Configuration: Unskip when re-enabling Configuration#setTimezone functionality
	QUnit.skip("Read timezone from URL", function(assert) {
		// setup
		browserUrl.change('?sap-ui-timezone=America/Los_Angeles');

		// call method under test
		Configuration.setCore();

		// verify results
		assert.equal(Configuration.getTimezone(), 'America/Los_Angeles', 'America/Los_Angeles is set');
	});

	// TODO Timezone Configuration: Unskip when re-enabling Configuration#setTimezone functionality
	QUnit.skip("Read timezone from URL sap-timezone", function(assert) {
		// setup
		browserUrl.change('?sap-timezone=America/Los_Angeles');

		// call method under test
		Configuration.setCore();

		// verify results
		assert.equal(Configuration.getTimezone(), 'America/Los_Angeles', 'America/Los_Angeles is set');

	});

	// TODO Timezone Configuration: Unskip when re-enabling Configuration#setTimezone functionality
	QUnit.skip("Read invalid timezone from URL sap-timezone", function(assert) {
		// setup
		browserUrl.change('?sap-timezone=invalid');

		// call method under test
		Configuration.setCore();

		// verify results
		assert.equal(Configuration.getTimezone(), sLocalTimezone, "fallback to '" + sLocalTimezone + "'");

	});

	QUnit.module("SAP parameters", {
		beforeEach: function(assert) {
			window["sap-ui-config"].language = "en";
		},
		afterEach: function() {
			browserUrl.reset();
		}
	});

	QUnit.test("Read SAP parameters from URL", function(assert) {

		// setup
		browserUrl.change('?sap-client=foo&sap-server=bar&sap-system=abc&sap-language=en');

		// call method under test
		Configuration.setCore();

		// verify results
		assert.equal(Configuration.getSAPParam('sap-client'), 'foo', 'SAP parameter sap-client=foo');
		assert.equal(Configuration.getSAPParam('sap-server'), 'bar', 'SAP parameter sap-server=bar');
		assert.equal(Configuration.getSAPParam('sap-system'), 'abc', 'SAP parameter sap-system=abc');
		assert.equal(Configuration.getSAPParam('sap-language'), 'EN', 'SAP parameter sap-language=en');


	});

	QUnit.test("Read SAP parameters from URL (ignoreUrlParams)", function(assert) {

		// setup
		browserUrl.change('?sap-client=foo&sap-server=bar&sap-system=abc&sap-language=de');
		window["sap-ui-config"].ignoreurlparams = true;

		// call method under test
		Configuration.setCore();

		// verify results
		assert.equal(Configuration.getSAPParam('sap-client'), undefined, 'SAP parameter sap-client=foo');
		assert.equal(Configuration.getSAPParam('sap-server'), undefined, 'SAP parameter sap-server=bar');
		assert.equal(Configuration.getSAPParam('sap-system'), undefined, 'SAP parameter sap-system=abc');
		assert.equal(Configuration.getSAPParam('sap-language'), 'EN', 'SAP parameter sap-language=en');

		delete window["sap-ui-config"].ignoreurlparams;

	});

	QUnit.test("Set SAPLogonLanguage and SAP parameter is updated", function(assert) {

		// setup
		browserUrl.change('?sap-language=EN');

		// call method under test
		Configuration.setCore();

		// verify results
		assert.equal(Configuration.getSAPParam('sap-language'), 'EN', 'SAP parameter sap-language=EN');
		Configuration.setLanguage("es");
		assert.equal(Configuration.getSAPParam('sap-language'), 'ES', 'SAP parameter sap-language=ES');


	});

	QUnit.test("Read SAP parameters from <meta> tag", function(assert) {

		// setup
		var metaTagClient = document.createElement("meta");
		metaTagClient.setAttribute("name", "sap-client");
		metaTagClient.setAttribute("content", "foo");
		document.head.appendChild(metaTagClient);

		var metaTagServer = document.createElement("meta");
		metaTagServer.setAttribute("name", "sap-server");
		metaTagServer.setAttribute("content", "bar");
		document.head.appendChild(metaTagServer);

		var metaTagSystem = document.createElement("meta");
		metaTagSystem.setAttribute("name", "sap-system");
		metaTagSystem.setAttribute("content", "abc");
		document.head.appendChild(metaTagSystem);

		// call method under test
		Configuration.setCore();

		// verify results
		assert.equal(Configuration.getSAPParam('sap-client'), 'foo', 'SAP parameter sap-client=foo');
		assert.equal(Configuration.getSAPParam('sap-server'), 'bar', 'SAP parameter sap-system=bar');
		assert.equal(Configuration.getSAPParam('sap-system'), 'abc', 'SAP parameter sap-client=abc');

		document.head.removeChild(metaTagClient);
		document.head.removeChild(metaTagServer);
		document.head.removeChild(metaTagSystem);

	});

	// "animationmode" is the normalized value, the application still needs to use "animationMode".
	var sAnimationModeConfigurationName = 'animationmode';
	QUnit.module("Animation", {
		beforeEach: function() {
			window['sap-ui-config'] = window["sap-ui-config"] || {};
			delete window["sap-ui-config"]['animation'];
			delete window["sap-ui-config"][sAnimationModeConfigurationName];
		}
	});

	QUnit.test("Default animation and animation mode", function(assert) {
		Configuration.setCore();
		assert.ok(Configuration.getAnimation(), "Default animation.");
		assert.equal(Configuration.getAnimationMode(), AnimationMode.full, "Default animation mode.");
	});

	QUnit.test("Animation is off, default animation mode", function(assert) {
		window['sap-ui-config'] = { animation: false };
		Configuration.setCore();
		assert.ok(!Configuration.getAnimation(), "Animation should be off.");
		assert.equal(Configuration.getAnimationMode(), AnimationMode.minimal, "Animation mode should switch to " + AnimationMode.minimal + ".");
	});

	QUnit.test("Animation is off, valid but not possible mode is set and sanitized", function(assert) {
		window['sap-ui-config']['animation'] = false;
		window['sap-ui-config'][sAnimationModeConfigurationName] = AnimationMode.basic;
		Configuration.setCore();
		assert.ok(Configuration.getAnimation(), "Animation should be on because animation mode overwrites animation.");
		assert.equal(Configuration.getAnimationMode(), AnimationMode.basic, "Animation mode should switch to " + AnimationMode.basic + ".");
	});

	QUnit.test("Invalid animation mode", function(assert) {
		window['sap-ui-config'][sAnimationModeConfigurationName] = "someuUnsupportedStringValue";
		assert.throws(
			function() { Configuration.setCore(); },
			new Error("Unsupported Enumeration value for animationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);
	});

	QUnit.test("Valid animation modes from enumeration", function(assert) {
		for (var sAnimationModeKey in AnimationMode) {
			if (AnimationMode.hasOwnProperty(sAnimationModeKey)) {
				var sAnimationMode = AnimationMode[sAnimationModeKey];
				window['sap-ui-config'][sAnimationModeConfigurationName] = sAnimationMode;
				Configuration.setCore();
				if (sAnimationMode === AnimationMode.none || sAnimationMode === AnimationMode.minimal) {
					assert.ok(!Configuration.getAnimation(), "Animation is switched to off because of animation mode.");
				} else {
					assert.ok(Configuration.getAnimation(), "Animation is switched to on because of animation mode.");
				}
				assert.equal(Configuration.getAnimationMode(), sAnimationMode, "Test for animation mode: " + sAnimationMode);
			}
		}
	});

	QUnit.module("Animation runtime", {
		before: function () {
			window["sap-ui-config"] = {};
			Configuration.setCore(oRealCore);
			this.getConfiguration = function () {
				return Configuration;
			};
		},
		afterEach: function() {
			// Restore default animation mode
			Configuration.setAnimationMode(AnimationMode.full);
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
		assert.equal(getHtmlAttribute("data-sap-ui-animation"), "on", "Default animation should be injected as attribute.");

		// Change animation mode
		oConfiguration.setAnimationMode(AnimationMode.none);
		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.none, "Animation mode should switch to " + AnimationMode.none + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.none, "Animation mode should be injected as attribute.");
		assert.equal(getHtmlAttribute("data-sap-ui-animation"), "off", "Animation should be turned off.");
	});

	QUnit.test("Invalid animation mode", function(assert) {
		var oConfiguration = this.getConfiguration();

		assert.throws(
			function() { oConfiguration.setAnimationMode("someUnsupportedStringValue"); },
			new Error("Unsupported Enumeration value for animationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);

		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full, "Default animation mode should stay the same.");
	});

	QUnit.module("Flexibility Services & Connectors", {
		afterEach: function () {
			delete window["sap-ui-config"]["flexibilityservices"];
		}
	});

	QUnit.test("Get the Flexibility Services", function(assert) {
		Configuration.setCore();
		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, [{layers: ["ALL"], connector: "LrepConnector", url: "/sap/bc/lrep"}]);
	});

	QUnit.test("Get the Flexibility Services - set to an empty string", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "";

		Configuration.setCore();
		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, []);
	});

	QUnit.test("Get the Flexibility Services - set to an empty array", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "[]";

		Configuration.setCore();
		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, []);
	});

	QUnit.test("Get the Flexibility Services - set to multiple objects", function(assert) {
		var oFirstConfigObject = {'layers': ['CUSTOMER'], 'connector': 'KeyUserConnector', 'url': '/flex/keyUser'};
		var oSecondConfigObject = {'layers': ['USER'], 'connector': 'PersonalizationConnector', 'url': '/sap/bc/lrep'};
		var aConfig = [oFirstConfigObject, oSecondConfigObject];
		var sConfigString = JSON.stringify(aConfig);

		window["sap-ui-config"]["flexibilityservices"] = sConfigString;

		Configuration.setCore();
		var sFlexibilityService = Configuration.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, aConfig);
	});

	function _getNumberOfFlModules(oCfg) {
		return oCfg.getValue("modules").filter(function(sModule) {
			return sModule === "sap.ui.fl.library";
		}).length;
	}

	QUnit.test("Set flexibilityServices enforces the loading of sap.ui.fl", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = '[{"connector": "KeyUser", "url": "/some/url", laverFilters: []}]';

		Configuration.setCore();
		assert.equal(_getNumberOfFlModules(Configuration), 1);
	});

	QUnit.test("Default flexibilityServices does NOT enforces the loading of sap.ui.fl", function(assert) {
		Configuration.setCore();
		assert.equal(_getNumberOfFlModules(Configuration), 0);
	});

	QUnit.test("Cleared flexibilityServices does NOT enforces the loading of sap.ui.fl", function(assert) {
		Configuration.setCore();
		assert.equal(_getNumberOfFlModules(Configuration), 0);
	});

	QUnit.test("Set flexibilityServices does NOT add the loading of sap.ui.fl an additional time if it is already set", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "";
		window["sap-ui-config"]["libs"] = 'sap.ui.fl';
		Configuration.setCore();
		assert.equal(_getNumberOfFlModules(Configuration), 1);
	});

	QUnit.test("Cleared flexibilityServices does NOT remove the loading of sap.ui.fl if it is set", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "";
		window["sap-ui-config"]["libs"] = 'sap.ui.fl';
		Configuration.setCore();
		assert.equal(_getNumberOfFlModules(Configuration), 1);
	});

	QUnit.module("ThemeRoot Validation", {
		before: HistoryUtils.check
	});

	[
		{
			caption: "Relative URL, All Origins",
			url: location.origin + "?sap-theme=custom@custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: location.origin + "/custom-theme/UI5/"
		},
		{
			caption: "Relative URL, no valid origins",
			url: location.origin + "?sap-theme=custom@custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: location.origin + "/custom-theme/UI5/"
		},
		{
			caption: "Relative URL, baseURI on different domain, no valid origins",
			url: location.origin + "?sap-theme=custom@custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: location.origin + "/custom-theme/UI5/",
			baseURI: "http://example.org"
		},
		{
			caption: "Relative URL, baseURI on different domain, All origins",
			url: location.origin + "?sap-theme=custom@custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: location.origin + "/custom-theme/UI5/",
			baseURI: "http://example.org"
		},
		{
			caption: "Relative URL, relative baseURI",
			url: location.origin + "/foo/bar/?sap-theme=custom@../custom-theme",
			allowedOrigins: null,
			expectedThemeRoot: location.origin + "/foo/custom-theme/UI5/",
			baseURI: "/some/other/path/"
		},
		{
			caption: "Absolute URL, All Origins",
			url: location.origin + "?sap-theme=custom@ftp://example.org/theming/custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: "ftp://example.org/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, Same Domain",
			url: location.origin + "?sap-theme=custom@" + location.origin + "/theming/custom-theme/",
			allowedOrigins: location.origin,
			expectedThemeRoot: location.origin + "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, Valid, but Different Domain",
			url: location.origin + "?sap-theme=custom@https://example.com/theming/custom-theme/",
			allowedOrigins: "https://example.com",
			expectedThemeRoot: "https://example.com/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, no valid origins",
			url: location.origin + "?sap-theme=custom@https://example.com/theming/custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: location.origin + "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, empty valid origins",
			url: location.origin + "?sap-theme=custom@https://example.com/theming/custom-theme/",
			allowedOrigins: "",
			expectedThemeRoot: location.origin + "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL with same protocol, Valid",
			url: location.origin + "?sap-theme=custom@//example.com/theming/custom-theme/",
			allowedOrigins: "example.com",
			expectedThemeRoot: "//example.com/theming/custom-theme/UI5/"
		}
	].forEach(function(oSetup) {

		QUnit.test(oSetup.caption, function(assert) {
			var oMeta = null, oBase = null, sExistingBaseHref;
			browserUrl.change(oSetup.url);
			if ( oSetup.allowedOrigins != null ) {
				oMeta = document.createElement("meta");
				oMeta.setAttribute("name", "sap-allowedThemeOrigins");
				oMeta.setAttribute("content", oSetup.allowedOrigins);
				document.head.appendChild(oMeta);
			}
			if ( oSetup.baseURI != null ) {
				oBase = document.querySelector("base");
				if (oBase) {
					sExistingBaseHref = oBase.getAttribute("href");
				} else {
					oBase = document.createElement("base");
					document.head.appendChild(oBase);
				}
				oBase.setAttribute("href", oSetup.baseURI);
			}
			try {
				Configuration.setCore(oRealCore);
				assert.equal(Configuration.getTheme(), "custom", "Configuration 'theme'");
				assert.equal(Configuration.getThemeRoot(), oSetup.expectedThemeRoot, "Configuration 'themeRoot'");
			} finally {
				browserUrl.reset();
				if ( oMeta ) {
					document.head.removeChild(oMeta);
				}
				if ( oBase ) {
					if ( sExistingBaseHref ) {
						oBase.setAttribute("href", sExistingBaseHref);
					} else {
						document.head.removeChild(oBase);
					}
				}
			}
		});

	});

	/*
	 * SAP strives to replace insensitive terms with inclusive language.
	 * Since APIs cannot be renamed or immediately removed for compatibility reasons, this API has been deprecated.
	*/
	QUnit.module("Deprecated / legacy configuration options", {
		beforeEach: function() {
			delete window["sap-ui-config"]["whitelistservice"];
			delete window["sap-ui-config"]["allowlistservice"];
			delete window["sap-ui-config"]["frameoptionsconfig"];
		},
		afterEach: function() {
			delete window["sap-ui-config"]["whitelistservice"];
			delete window["sap-ui-config"]["allowlistservice"];
			delete window["sap-ui-config"]["frameoptionsconfig"];
			if (this.oMetaWhiteList) {
				if (this.oMetaWhiteList.parentNode) {
					this.oMetaWhiteList.parentNode.removeChild(this.oMetaWhiteList);
				}
				this.oMetaWhiteList = null;
			}
			if (this.oMetaAllowList) {
				if (this.oMetaAllowList.parentNode) {
					this.oMetaAllowList.parentNode.removeChild(this.oMetaAllowList);
				}
				this.oMetaAllowList = null;
			}
		}
	});

	// Whitelist service only
	QUnit.test("whitelistService", function(assert) {
		var SERVICE_URL = "/service/url/from/config";
		window["sap-ui-config"]["whitelistservice"] = SERVICE_URL;
		Configuration.setCore();
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.test("sap.whitelistService meta tag", function(assert) {
		var SERVICE_URL = "/service/url/from/meta";
		this.oMetaWhiteList = document.createElement('meta');
		this.oMetaWhiteList.setAttribute('name', 'sap.whitelistService');
		this.oMetaWhiteList.setAttribute('content', SERVICE_URL);
		document.head.appendChild(this.oMetaWhiteList);

		Configuration.setCore();
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.test("frameOptionsConfig.whitelist", function(assert) {
		var LIST = "example.com";
		window["sap-ui-config"]["frameoptionsconfig"] = {
			whitelist: LIST
		};
		Configuration.setCore();
		assert.equal(Configuration.getValue("frameOptionsConfig").whitelist, LIST, "Deprecated frameOptionsConfig.whitelist should be set");
		assert.equal(Configuration.getValue("frameOptionsConfig").allowlist, LIST, "Successor frameOptionsConfig.allowlist should be set");
	});

	// AllowList Service only
	QUnit.test("allowlistService", function(assert) {
		var SERVICE_URL = "/service/url/from/config";
		window["sap-ui-config"]["allowlistservice"] = SERVICE_URL;
		Configuration.setCore();
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.test("sap.allowlistService meta tag", function(assert) {
		var SERVICE_URL = "/service/url/from/meta";
		this.oMetaWhiteList = document.createElement('meta');
		this.oMetaWhiteList.setAttribute('name', 'sap.allowlistService');
		this.oMetaWhiteList.setAttribute('content', SERVICE_URL);
		document.head.appendChild(this.oMetaWhiteList);

		Configuration.setCore();
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.test("frameOptionsConfig.allowlist", function(assert) {
		var LIST = "example.com";
		window["sap-ui-config"]["frameoptionsconfig"] = {
			allowlist: LIST
		};
		Configuration.setCore();
		assert.equal(Configuration.getValue("frameOptionsConfig").whitelist, undefined, "Deprecated frameOptionsConfig.whitelist should not be set");
		assert.equal(Configuration.getValue("frameOptionsConfig").allowlist, LIST, "Successor frameOptionsConfig.allowlist should be set");
	});

	// AllowList mixed with WhiteList Service (AllowList should be preferred)
	QUnit.test("whitelistService mixed with allowlistService", function(assert) {
		var SERVICE_URL = "/service/url/from/config";
		window["sap-ui-config"]["whitelistservice"] = SERVICE_URL;
		window["sap-ui-config"]["allowlistservice"] = SERVICE_URL;
		Configuration.setCore();
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.test("sap.whitelistService mixed with sap.allowlistService meta tag", function(assert) {
		var SERVICE_URL = "/service/url/from/meta";
		this.oMetaWhiteList = document.createElement('meta');
		this.oMetaWhiteList.setAttribute('name', 'sap.whitelistService');
		this.oMetaWhiteList.setAttribute('content', SERVICE_URL);
		document.head.appendChild(this.oMetaWhiteList);

		this.oMetaAllowList = document.createElement('meta');
		this.oMetaAllowList.setAttribute('name', 'sap.allowlistService');
		this.oMetaAllowList.setAttribute('content', SERVICE_URL);
		document.head.appendChild(this.oMetaAllowList);

		Configuration.setCore();
		assert.equal(Configuration.getWhitelistService(), SERVICE_URL, "Deprecated getWhitelistService should return service url");
		assert.equal(Configuration.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.test("frameOptionsConfig.whitelist mixed with frameoptions.allowlist", function(assert) {
		var LIST = "example.com";
		window["sap-ui-config"]["frameoptionsconfig"] = {
			allowlist: LIST,
			whitelist: LIST
		};
		Configuration.setCore();
		assert.equal(Configuration.getValue("frameOptionsConfig").whitelist, LIST, "Deprecated frameOptionsConfig.whitelist should be set");
		assert.equal(Configuration.getValue("frameOptionsConfig").allowlist, LIST, "Successor frameOptionsConfig.allowlist should be set");
	});

	QUnit.module("OData V4");

	QUnit.test("securityTokenHandlers", function(assert) {
		var oCfg = Configuration,
			fnSecurityTokenHandler1 = function () {},
			fnSecurityTokenHandler2 = function () {},
			aSecurityTokenHandlers = [fnSecurityTokenHandler1];

		// code under test
		Configuration.setCore();

		assert.deepEqual(oCfg.getSecurityTokenHandlers(), []);

		// bootstrap does some magic and converts to lower case, test does not :-(
		window["sap-ui-config"].securitytokenhandlers = [];

		// code under test
		Configuration.setCore();

		assert.strictEqual(oCfg.getSecurityTokenHandlers().length, 0, "check length");

		window["sap-ui-config"].securitytokenhandlers = aSecurityTokenHandlers;

		// code under test
		Configuration.setCore();

		assert.notStrictEqual(aSecurityTokenHandlers, oCfg.securityTokenHandlers);
		assert.strictEqual(oCfg.getSecurityTokenHandlers().length, 1, "check length");
		assert.strictEqual(oCfg.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1, "check Fn");

		window["sap-ui-config"].securitytokenhandlers
			= [fnSecurityTokenHandler1, fnSecurityTokenHandler2];

		// code under test
		Configuration.setCore();

		assert.strictEqual(oCfg.getSecurityTokenHandlers().length, 2, "check length");
		assert.strictEqual(oCfg.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1, "check Fn");
		assert.strictEqual(oCfg.getSecurityTokenHandlers()[1], fnSecurityTokenHandler2, "check Fn");

		window["sap-ui-config"].securitytokenhandlers = fnSecurityTokenHandler1;

		assert.throws(function () {
			// code under test
			Configuration.setCore();
		}); // aSecurityTokenHandlers.forEach is not a function

		window["sap-ui-config"].securitytokenhandlers = [fnSecurityTokenHandler1, "foo"];

		assert.throws(function () {
			// code under test
			Configuration.setCore();
		}, "Not a function: foo");

		// code under test
		oCfg.setSecurityTokenHandlers(aSecurityTokenHandlers);

		assert.notStrictEqual(aSecurityTokenHandlers, oCfg.securityTokenHandlers);
		assert.notStrictEqual(oCfg.getSecurityTokenHandlers(), oCfg.securityTokenHandlers);
		assert.strictEqual(oCfg.getSecurityTokenHandlers().length, 1);
		assert.strictEqual(oCfg.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1);

		assert.throws(function () {
			// code under test
			oCfg.setSecurityTokenHandlers([fnSecurityTokenHandler1, "foo"]);
		}, "Not a function: foo");

		assert.throws(function () {
			// code under test
			oCfg.setSecurityTokenHandlers([undefined]);
		}, "Not a function: undefined");

		assert.throws(function () {
			// code under test
			oCfg.setSecurityTokenHandlers("foo");
		}); // aSecurityTokenHandlers.forEach is not a function

		// code under test
		oCfg.setSecurityTokenHandlers([fnSecurityTokenHandler1, fnSecurityTokenHandler2]);

		assert.strictEqual(oCfg.getSecurityTokenHandlers().length, 2);
		assert.strictEqual(oCfg.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1);
		assert.strictEqual(oCfg.getSecurityTokenHandlers()[1], fnSecurityTokenHandler2);

		// code under test
		oCfg.setSecurityTokenHandlers([]);

		assert.deepEqual(oCfg.getSecurityTokenHandlers(), []);

		delete window["sap-ui-config"].securitytokenhandlers;
	});
});
