/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/core/CalendarType',
	'sap/ui/core/Configuration',
	'sap/ui/core/Core',
	'sap/ui/core/Locale',
	'sap/base/Log',
	'sap/ui/core/LocaleData' // only used indirectly via Configuration.getCalendarType
], function(CalendarType, Configuration, Core, Locale, Log) {
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

	function getHtmlAttribute(sAttribute) {
		return document.documentElement.getAttribute(sAttribute);
	}

	QUnit.module("Basic");

	QUnit.test("Settings", function(assert) {
		var oCfg = new Configuration();
		assert.equal(oCfg.theme, "sap_belize", "tag config should override global config");
		assert.deepEqual(oCfg.modules, ["sap.ui.core.library"], "Module List in configuration matches configured modules/libraries");
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
		assert.strictEqual(oFormatSettings.getLegacyDateCalendarCustomizing(), aData, "The customizing data set can be retrieved");
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
			this.oConfig = new Configuration(this.oCoreMock);
		}
	});

	QUnit.test("setLanguage(en) - noop", function(assert) {
		this.oConfig.setLanguage("en");
		assert.equal(this.oConfig.getLanguage(), "en", "language still should be 'en'");
		assert.equal(this.oConfig.getSAPLogonLanguage(), "EN", "SAP Logon language should be 'EN'");
		assert.equal(this.eventsReceived, 0, "one localizationChange event should have been fired");
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
		assert.equal(this.oConfig.getRTL(), false, "language 'he' must not change the explicitily configured RTL flag");
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
		oConfig.setLanguage("zh-Hans");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZH", "SAP Logon language should be 'ZH'");
		oConfig.setLanguage("zh-Hans-CN");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZH", "SAP Logon language should be 'ZH'");
		oConfig.setLanguage("zh-TW");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZF", "SAP Logon language should be 'ZF'");
		oConfig.setLanguage("zh-Hant");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZF", "SAP Logon language should be 'ZF'");
		oConfig.setLanguage("zh-Hant-TW");
		assert.equal(oConfig.getSAPLogonLanguage(), "ZF", "SAP Logon language should be 'ZF'");
		oConfig.setLanguage("en-US-x-saptrc");
		assert.equal(oConfig.getSAPLogonLanguage(), "1Q", "SAP Logon language should be '1Q'");
		oConfig.setLanguage("en-US-x-sappsd");
		assert.equal(oConfig.getSAPLogonLanguage(), "2Q", "SAP Logon language should be '2Q'");
	});

	QUnit.test("configured via API", function(assert) {
		var oConfig = Core.getConfiguration();
		//  SAP language provided by caller of setLanguage
		oConfig.setLanguage("en-GB");
		assert.equal(oConfig.getSAPLogonLanguage(), "EN", "setting only BCP47 language can only return 'EN'");
		oConfig.setLanguage("en-GB", "6N"); // note: only SAPLanguage changes!
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "setting both values must return the extected SAP Language '6N'");
		oConfig.setLanguage("en-GB");
		assert.equal(oConfig.getSAPLogonLanguage(), "EN", "setting only BCP47 language again must reset the knowledge about SAP Language");
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
				return new Configuration(oCoreMock);
			};
		},
		afterEach: function() {
			browserUrl.reset();
		}
	});

	[
		/* URL parameter							language			languageTag 		SAP-L	Caption */
		[ "?sap-language=EN",						"EN",				"en",				"EN",	"sap-language is the valid ISO language EN"],
		[ "?sap-language=ZH",						"zh-Hans",			"zh-Hans",			"ZH",	"sap-language is the known SAP language ZN"],
		[ "?sap-language=ZF",						"zh-Hant",			"zh-Hant",			"ZF",	"sap-language is the known SAP language ZF"],
		[ "?sap-language=1Q",						"en-US-x-saptrc",	"en-US-x-saptrc",	"1Q",	"sap-language is the known SAP language 1Q"],
		[ "?sap-language=2Q",						"en-US-x-sappsd",	"en-US-x-sappsd",	"2Q",	"sap-language is the known SAP language 2Q"],
		[ "?sap-language=6N",						"de",				"de",				"6N",	"sap-language is the unknown SAP language 6N"],
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
		assert.equal(oConfig.getLanguage(), "de", "the effective language still should be 'de'");
		assert.equal(oConfig.getLanguageTag(), "de", "the effective language tag still should be 'de'");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N' already");

		// without the second parameter, the sap language now would be 'EN' only
		oConfig.setLanguage("en-GB");
		assert.equal(oConfig.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(oConfig.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(oConfig.getSAPLogonLanguage(), "EN", "the SAP Logon language should be 'EN'");

		// but with the second parameter, everything should be fine
		oConfig.setLanguage("en-GB", "6N");
		assert.equal(oConfig.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(oConfig.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(oConfig.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N'");

	});

	QUnit.test("error reporting", function(assert) {
		this.stub(Log, 'warning');
		this.setupConfig("de", "?sap-language=6N&sap-locale=en-GB");
		assert.strictEqual(Log.warning.called, false, "no warning should be written if accompanied by sap-locale");
		this.setupConfig("de", "?sap-language=6N&sap-ui-language=en-GB");
		assert.strictEqual(Log.warning.called, false, "no warning should be written if accompanied by sap-ui-language");
		this.setupConfig("de", "?sap-language=6N");
		assert.ok(Log.warning.calledWith(sinon.match(/6N/).and(sinon.match(/BCP-?47/i))), "warning must have been written");
		assert.throws(function() {
			this.setupConfig("de", "?sap-locale=6N&sap-language=6N");
		}, "setting an invalid (non-BCP-47) sap-locale should cause an error");
		assert.throws(function() {
			this.setupConfig("de", "?sap-ui-language=6N&sap-language=6N");
		}, "setting an invalid (non-BCP-47) sap-ui-language should cause an error");
	});

	QUnit.test("Format Locale", function(assert) {
		var oConfig;

		window['sap-ui-config'].formatlocale = 'fr-CH'; // Note: Configuration expects sap-ui-config names converted to lowercase (done by bootstrap)
		oConfig = this.setupConfig("fr-FR", "");
		assert.equal(oConfig.getLanguageTag(), "fr-FR", "language should be fr-FR");
		assert.equal(oConfig.getFormatLocale(), "fr-CH", "format locale string should be fr-CH");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Locale, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "fr-CH", "format locale should be fr-CH");

		window['sap-ui-config'].formatlocale = null;
		oConfig = this.setupConfig("fr-FR", "");
		assert.equal(oConfig.getLanguageTag(), "fr-FR", "language should be fr-FR");
		assert.equal(oConfig.getFormatLocale(), "fr-FR", "format locale string should be fr-CH");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Locale, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "fr-FR", "format locale should be fr-CH");
		delete window['sap-ui-config'].formatlocale;

		oConfig = this.setupConfig("de", "?sap-language=EN&sap-ui-formatLocale=en-AU");
		assert.equal(oConfig.getLanguageTag(), "en", "language should be en");
		assert.equal(oConfig.getFormatLocale(), "en-AU", "format locale string should be en-AU");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Locale, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "en-AU", "format locale should be en-AU");

		oConfig.setFormatLocale("en-CA");
		assert.equal(oConfig.getFormatLocale(), "en-CA", "format locale string should be en-CA");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Locale, "format locale should exist");
		assert.equal(oConfig.getFormatSettings().getFormatLocale().toString(), "en-CA", "format locale should be en-CA");

		oConfig.setFormatLocale();
		assert.equal(oConfig.getFormatLocale(), "en", "format locale string should be en");
		assert.ok(oConfig.getFormatSettings().getFormatLocale() instanceof Locale, "format locale should exist");
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

		var oSpySetLegacyNumberFormat = sinon.spy(Configuration.FormatSettings.prototype, "setLegacyNumberFormat");

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
			var oConfig = new Configuration();

			// verify results
			assert.equal(oSpySetLegacyNumberFormat.callCount, 1, "setLegacyNumberFormat with value: '" + data.param + "' must be called");
			assert.equal(oConfig.getFormatSettings().getLegacyNumberFormat(), data.expected, "Value of number format must be '" + data.expected + "'.");

			oConfig.destroy();
		});
	});

	QUnit.test("Read 'sap-ui-legacy-date-format' from URL", function(assert) {

		var oSpySetLegacyDateFormat = sinon.spy(Configuration.FormatSettings.prototype, "setLegacyDateFormat");

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

			var oConfig = new Configuration();

			assert.equal(oSpySetLegacyDateFormat.callCount, 1, "setLegacyDateFormat must have been called one time");
			assert.equal(oConfig.getFormatSettings().getLegacyDateFormat(), data.expected, "Value of date format must be '" + data.expected + "'.");

			oConfig.destroy();

		});
	});

	QUnit.test("Read 'sap-ui-legacy-time-format' from URL", function(assert) {
		var oSpySetLegacyTimeFormat = sinon.spy(Configuration.FormatSettings.prototype, "setLegacyTimeFormat");

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

			var oConfig = new Configuration();

			assert.equal(oSpySetLegacyTimeFormat.callCount, 1, "setLegacyTimeFormat must be called one time");
			assert.equal(oConfig.getFormatSettings().getLegacyTimeFormat(), data.expected, "Value of time format must be '" + data.expected + "'.");

			oConfig.destroy();

		});
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
		var oConfig = new Configuration();

		// verify results
		assert.equal(oConfig.getSAPParam('sap-client'), 'foo', 'SAP parameter sap-client=foo');
		assert.equal(oConfig.getSAPParam('sap-server'), 'bar', 'SAP parameter sap-server=bar');
		assert.equal(oConfig.getSAPParam('sap-system'), 'abc', 'SAP parameter sap-system=abc');
		assert.equal(oConfig.getSAPParam('sap-language'), 'en', 'SAP parameter sap-language=en');

		oConfig.destroy();

	});

	QUnit.test("Read SAP parameters from URL (ignoreUrlParams)", function(assert) {

		// setup
		browserUrl.change('?sap-client=foo&sap-server=bar&sap-system=abc&sap-language=de');
		window["sap-ui-config"].ignoreurlparams = true;

		// call method under test
		var oConfig = new Configuration();

		// verify results
		assert.equal(oConfig.getSAPParam('sap-client'), undefined, 'SAP parameter sap-client=foo');
		assert.equal(oConfig.getSAPParam('sap-server'), undefined, 'SAP parameter sap-server=bar');
		assert.equal(oConfig.getSAPParam('sap-system'), undefined, 'SAP parameter sap-system=abc');
		assert.equal(oConfig.getSAPParam('sap-language'), 'EN', 'SAP parameter sap-language=en');

		oConfig.destroy();
		delete window["sap-ui-config"].ignoreurlparams;

	});

	QUnit.test("Set SAPLogonLanguage and SAP parameter is updated", function(assert) {

		// setup
		browserUrl.change('?sap-language=EN');

		// call method under test
		var oConfig = new Configuration();

		// verify results
		assert.equal(oConfig.getSAPParam('sap-language'), 'EN', 'SAP parameter sap-language=EN');
		oConfig.setLanguage("es");
		assert.equal(oConfig.getSAPParam('sap-language'), 'ES', 'SAP parameter sap-language=ES');

		oConfig.destroy();

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
		var oConfig = new Configuration();

		// verify results
		assert.equal(oConfig.getSAPParam('sap-client'), 'foo', 'SAP parameter sap-client=foo');
		assert.equal(oConfig.getSAPParam('sap-server'), 'bar', 'SAP parameter sap-system=bar');
		assert.equal(oConfig.getSAPParam('sap-system'), 'abc', 'SAP parameter sap-client=abc');

		oConfig.destroy();
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
		var oConfiguration = new Configuration();
		assert.ok(oConfiguration.getAnimation(), "Default animation.");
		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.full, "Default animation mode.");
	});

	QUnit.test("Animation is off, default animation mode", function(assert) {
		window['sap-ui-config'] = { animation: false };
		var oConfiguration = new Configuration();
		assert.ok(!oConfiguration.getAnimation(), "Animation should be off.");
		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.minimal, "Animation mode should switch to " + AnimationMode.minimal + ".");
	});

	QUnit.test("Animation is off, valid but not possible mode is set and sanitized", function(assert) {
		window['sap-ui-config']['animation'] = false;
		window['sap-ui-config'][sAnimationModeConfigurationName] = AnimationMode.basic;
		var oConfiguration = new Configuration();
		assert.ok(oConfiguration.getAnimation(), "Animation should be on because animation mode overwrites animation.");
		assert.equal(oConfiguration.getAnimationMode(), AnimationMode.basic, "Animation mode should switch to " + AnimationMode.basic + ".");
	});

	QUnit.test("Invalid animation mode", function(assert) {
		window['sap-ui-config'][sAnimationModeConfigurationName] = "someuUnsupportedStringValue";
		assert.throws(
			function() { new Configuration(); },
			new Error("Unsupported Enumeration value for animationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);
	});

	QUnit.test("Valid animation modes from enumeration", function(assert) {
		for (var sAnimationModeKey in AnimationMode) {
			if (AnimationMode.hasOwnProperty(sAnimationModeKey)) {
				var sAnimationMode = AnimationMode[sAnimationModeKey];
				window['sap-ui-config'][sAnimationModeConfigurationName] = sAnimationMode;
				var oConfiguration = new Configuration();
				if (sAnimationMode === AnimationMode.none || sAnimationMode === AnimationMode.minimal) {
					assert.ok(!oConfiguration.getAnimation(), "Animation is switched to off because of animation mode.");
				} else {
					assert.ok(oConfiguration.getAnimation(), "Animation is switched to on because of animation mode.");
				}
				assert.equal(oConfiguration.getAnimationMode(), sAnimationMode, "Test for animation mode: " + sAnimationMode);
			}
		}
	});

	QUnit.module("Animation runtime", {
		beforeEach: function() {
			this.getConfiguration = function () {
				return sap.ui.getCore().getConfiguration();
			};
		},
		afterEach: function() {
			// Restore default animation mode
			sap.ui.getCore().getConfiguration().setAnimationMode(AnimationMode.full);
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
		var oCfg = new Configuration();
		var sFlexibilityService = oCfg.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, [{layers: ["ALL"], connector: "LrepConnector", url: "/sap/bc/lrep"}]);
	});

	QUnit.test("Get the Flexibility Services - set to an empty string", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "";

		var oCfg = new Configuration();
		var sFlexibilityService = oCfg.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, []);
	});

	QUnit.test("Get the Flexibility Services - set to an empty array", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "[]";

		var oCfg = new Configuration();
		var sFlexibilityService = oCfg.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, []);
	});

	QUnit.test("Get the Flexibility Services - set to multiple objects", function(assert) {
		var oFirstConfigObject = {'layers': ['CUSTOMER'], 'connector': 'KeyUserConnector', 'url': '/flex/keyUser'};
		var oSecondConfigObject = {'layers': ['USER'], 'connector': 'PersonalizationConnector', 'url': '/sap/bc/lrep'};
		var aConfig = [oFirstConfigObject, oSecondConfigObject];
		var sConfigString = JSON.stringify(aConfig);

		window["sap-ui-config"]["flexibilityservices"] = sConfigString;

		var oCfg = new Configuration();
		var sFlexibilityService = oCfg.getFlexibilityServices();
		assert.deepEqual(sFlexibilityService, aConfig);
	});

	function _getNumberOfFlModules(oCfg) {
		return oCfg.modules.filter(function(sModule) {
			return sModule === "sap.ui.fl.library";
		}).length;
	}

	QUnit.test("Set flexibilityServices enforces the loading of sap.ui.fl", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = '[{"connector": "KeyUser", "url": "/some/url", laverFilters: []}]';

		var oCfg = new Configuration();
		assert.equal(_getNumberOfFlModules(oCfg), 1);
	});

	QUnit.test("Set flexibilityServices URL enforces the loading of sap.ui.fl", function(assert) {

		var sEncodedConfig = encodeURI('[{"connector":"KeyUser","url": "/some/url","laverFilters":[]}]');
		browserUrl.change(location.origin + "?sap-ui-flexibilityServices="  + sEncodedConfig);

		try {
			var oCfg = new Configuration();
			assert.equal(_getNumberOfFlModules(oCfg), 1);
		} finally {
			browserUrl.reset();
		}
	});

	QUnit.test("Default flexibilityServices does NOT enforces the loading of sap.ui.fl", function(assert) {
		var oCfg = new Configuration();
		assert.equal(_getNumberOfFlModules(oCfg), 0);
	});

	QUnit.test("Cleared flexibilityServices does NOT enforces the loading of sap.ui.fl", function(assert) {
		var oCfg = new Configuration();
		assert.equal(_getNumberOfFlModules(oCfg), 0);
	});

	QUnit.test("Set flexibilityServices does NOT add the loading of sap.ui.fl an additional time if it is already set", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "";
		window["sap-ui-config"]["libs"] = 'sap.ui.fl';
		var oCfg = new Configuration();
		assert.equal(_getNumberOfFlModules(oCfg), 1);
	});

	QUnit.test("Cleared flexibilityServices does NOT remove the loading of sap.ui.fl if it is set", function(assert) {
		window["sap-ui-config"]["flexibilityservices"] = "";
		window["sap-ui-config"]["libs"] = 'sap.ui.fl';
		var oCfg = new Configuration();
		assert.equal(_getNumberOfFlModules(oCfg), 1);
	});

	QUnit.module("ThemeRoot Validation");

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
				var oCfg = new Configuration();
				assert.equal(oCfg.theme, "custom", "Configuration 'theme'");
				assert.equal(oCfg.themeRoot, oSetup.expectedThemeRoot, "Configuration 'themeRoot'");
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

});
