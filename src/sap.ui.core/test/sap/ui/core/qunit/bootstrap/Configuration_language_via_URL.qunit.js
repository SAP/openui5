/*global QUnit, sinon */

/**
 * @fileoverview
 * @deprecated
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/config",
	"sap/base/config/GlobalConfigurationProvider",
	"sap/ui/base/config/URLConfigurationProvider",
	"sap/ui/core/Configuration",
	"sap/ui/core/Locale",
	"sap/ui/core/date/CalendarWeekNumbering"
], (
	Log,
	BaseConfig,
	GlobalConfigurationProvider,
	URLConfigurationProvider,
	Configuration,
	Locale,
	CalendarWeekNumbering
) => {
	"use strict";

	QUnit.module("SAP Logon Language (via url)", {
		beforeEach: (assert) => {
			this.setupConfig = (sLanguage, data) => {
				data = data ? data : {};
				this.oURLProviderStub && this.oURLProviderStub.restore();
				this.oURLProviderStub = sinon.stub(URLConfigurationProvider, "get");
				this.oURLProviderStub.callsFake((sKey) => {
					if (sKey === "sapUiLanguage") {
						return data["sap-ui-language"] || undefined;
					} else if (sKey === "sapLanguage") {
						return data["sap-language"] || this.oURLProviderStub.wrappedMethod.call(this, sKey);
					} else if (sKey === "sapLocale") {
						return data["sap-locale"] || this.oURLProviderStub.wrappedMethod.call(this, sKey);
					} else if (sKey === "sapUiFormatLocale") {
						return data["sap-ui-formatLocale"] || this.oURLProviderStub.wrappedMethod.call(this, sKey);
					} else {
						return this.oURLProviderStub.wrappedMethod.call(this, sKey);
					}
				});

				this.oGlobalProviderStub && this.oGlobalProviderStub.restore();
				this.oGlobalProviderStub = sinon.stub(GlobalConfigurationProvider, "get");
				this.oGlobalProviderStub.callsFake((sKey) => {
					if (sKey === "sapUiLanguage") {
						return sLanguage || "";
					} else {
						return this.oGlobalProviderStub.wrappedMethod.call(this, sKey);
					}
				});

				// reset sapLogonLanguage
				Configuration.setCalendarWeekNumbering(CalendarWeekNumbering.Default);
				BaseConfig._.invalidate();
				Configuration.setCore({
					fireLocalizationChanged: () => {}
				});
				return Configuration;
			};
		},
		afterEach: () => {
			this.oURLProviderStub && this.oURLProviderStub.restore();
			this.oGlobalProviderStub && this.oGlobalProviderStub.restore();
		}
	});

	[
		/* URL parameter							language			languageTag 		SAP-L	Caption */
		[ {"sap-language": "en"},								"en",				"en",				"EN",	"sap-language is the valid ISO language EN"],
		[ {"sap-language": "EN"},								"EN",				"en",				"EN",	"sap-language is the valid ISO language EN"],
		[ {"sap-language": "ZH"},								"zh-Hans",			"zh-Hans",			"ZH",	"sap-language is the known SAP language ZN"],
		[ {"sap-language": "ZF"},								"zh-Hant",			"zh-Hant",			"ZF",	"sap-language is the known SAP language ZF"],
		[ {"sap-language": "1Q"},								"en-US-x-saptrc",	"en-US-x-saptrc",	"1Q",	"sap-language is the known SAP language 1Q"],
		[ {"sap-language": "2Q"},								"en-US-x-sappsd",	"en-US-x-sappsd",	"2Q",	"sap-language is the known SAP language 2Q"],
		[ {"sap-language": "3Q"},								"en-US-x-saprigi",	"en-US-x-saprigi",	"3Q",	"sap-language is the known SAP language 3Q"],
		[ {"sap-language": "6N"},								"en-GB",			"en-GB",			"6N",	"sap-language is the unknown SAP language 6N"],
		[ {"sap-language": "SH"},								"sr-Latn",			"sh",		    	"SH",	"sap-language is the unknown SAP language 6N"],
		[ {"sap-locale": "fr_CH"},								"fr_CH",			"fr-CH",			"FR",	"sap-locale is the accepted BCP47 tag fr_CH"],
		[ {"sap-locale": "En_gb", "sap-language": "6N"},		"En_gb",			"en-GB",			"6N",	"valid combination of sap-locale and sap-language (En_gb, 6N)"],
		[ {"sap-ui-language":"en_GB", "sap-language": "6N"},	"en-GB",			"en-GB",			"6N",	"valid combination of sap-ui-language and sap-language (en_GB, 6N)"],
		[ {"sap-language": "EN", "sap-locale": "en_GB"},		"en_GB",			"en-GB",			"EN",	"valid combination of sap-language and sap-locale, both as BCP47 tag (EN, en_GB)"]
	].forEach((data) => {
		QUnit.test(data[4], (assert) => {
			this.setupConfig("de", data[0]);
			assert.equal(Configuration.getLanguage(), data[1], "the effective language should be '" + data[1] + "'");
			assert.equal(Configuration.getLanguageTag(), data[2], "the effective language tag should be '" + data[2] + "'");
			assert.equal(Configuration.getSAPLogonLanguage(), data[3], "the SAP Logon language should be '" + data[3] + "'");
		});
	});

	QUnit.test("error reporting", (assert) => {
		sinon.stub(Log, 'warning').callThrough();
		this.setupConfig("de", {"sap-language":"1E", "sap-locale": "en-GB"});
		Configuration.getLanguage();
		assert.strictEqual(Log.warning.called, false, "no warning should be written if accompanied by sap-locale");
		this.setupConfig("de", {"sap-language":"1E", "sap-ui-language":"en-GB"});
		Configuration.getLanguage();
		assert.strictEqual(Log.warning.called, false, "no warning should be written if accompanied by sap-ui-language");
		this.setupConfig(null, {"sap-language" :"1E"});
		Configuration.getLanguage();
		assert.ok(Log.warning.calledWith(sinon.match(/1E/).and(sinon.match(/BCP-?47/i))), "warning must have been written");
		assert.throws(() => {
			this.setupConfig("de", {"sap-locale":"1E","sap-language":"1E"});
			Configuration.getLanguage();
		}, "setting an invalid (non-BCP-47) sap-locale should cause an error");
		assert.throws(() => {
			this.setupConfig("de", {"sap-ui-language":"1E", "sap-language":"1E"});
			Configuration.getLanguage();
		}, "setting an invalid (non-BCP-47) sap-ui-language should cause an error");
	});

	QUnit.test("Format Locale", (assert) => {
		var rMethodsToIgnore = /^(_|destroy|getInterface$|getMetadata$|isA$)/;

		// Checks via duck-typing whether the given object is an instance of Locale
		// The check should work with facades (1.x) as well as with instances (2.x)
		const assertCoreLocale = (oObject) => {
			var aMethodNames = Object.keys(Locale.prototype).filter((sKey) => {
				return !rMethodsToIgnore.test(sKey) && typeof Locale.prototype[sKey] === "function";
			});

			aMethodNames.forEach((sMethodName) => {
				assert.strictEqual(typeof oObject[sMethodName], "function",
					"expected interface method should actually exist: " + sMethodName);
			});

			for (var sMethodName in oObject) {
				if (!rMethodsToIgnore.test(sMethodName) && typeof oObject[sMethodName] === "function") {
					assert.ok(aMethodNames.includes(sMethodName),
						"actual method should be part of expected interface: " + sMethodName);
				}
			}
		};

		//window['sap-ui-config'].formatlocale = 'fr-CH'; // Note: Configuration expects sap-ui-config names converted to lowercase (done by bootstrap)
		this.setupConfig("fr-FR", {});
		Configuration.setFormatLocale("fr-CH");
		assert.equal(Configuration.getLanguageTag(), "fr-FR", "language should be fr-FR");
		assert.equal(Configuration.getFormatLocale(), "fr-CH", "format locale string should be fr-CH");
		assert.ok(Configuration.getFormatSettings().getFormatLocale(), "format locale should exist");
		assertCoreLocale(Configuration.getFormatSettings().getFormatLocale());
		assert.equal(Configuration.getFormatSettings().getFormatLocale().toString(), "fr-CH", "format locale should be fr-CH");

		//window['sap-ui-config'].formatlocale = null;
		this.setupConfig("fr-FR", {});
		Configuration.setFormatLocale(null);
		assert.equal(Configuration.getLanguageTag(), "fr-FR", "language should be fr-FR");
		assert.equal(Configuration.getFormatLocale(), "fr-FR", "format locale string should be fr-CH");
		assert.ok(Configuration.getFormatSettings().getFormatLocale(), "format locale should exist");
		assert.equal(Configuration.getFormatSettings().getFormatLocale().toString(), "fr-FR", "format locale should be fr-CH");

		this.setupConfig("de", {"sap-language": "EN", "sap-ui-formatLocale": "en-AU"});
		assert.equal(Configuration.getLanguageTag(), "en", "language should be en");
		assert.equal(Configuration.getFormatLocale(), "en-AU", "format locale string should be en-AU");
		assert.ok(Configuration.getFormatSettings().getFormatLocale(), "format locale should exist");
		assert.equal(Configuration.getFormatSettings().getFormatLocale().toString(), "en-AU", "format locale should be en-AU");

		this.setupConfig();
		Configuration.setFormatLocale("en-CA");
		assert.equal(Configuration.getFormatLocale(), "en-CA", "format locale string should be en-CA");
		assert.ok(Configuration.getFormatSettings().getFormatLocale(), "format locale should exist");
		assert.equal(Configuration.getFormatSettings().getFormatLocale().toString(), "en-CA", "format locale should be en-CA");

		this.setupConfig("de", {"sap-language": "EN"});
		Configuration.setFormatLocale();
		assert.equal(Configuration.getFormatLocale(), "en", "format locale string should be en");
		assert.ok(Configuration.getFormatSettings().getFormatLocale(), "format locale should exist");
		assert.equal(Configuration.getFormatSettings().getFormatLocale().toString(), "en", "format locale should be en");

		assert.throws(() => {
			Configuration.setFormatLocale('6N');
		}, "setting an invalid (non-BCP-47) format locale should cause an error");
		assert.throws(() => {
			Configuration.setFormatLocale(new Date());
		}, "setting a non-string value as format locale should cause an error");
	});

	// url: sap-language=en
	// window: language=de
	// ==> en
	// url: sap-language=en&sap-ui-language=de
	// ==> de

	QUnit.test("language via url, locale+language via API", (assert) => {
		this.setupConfig("de", {"sap-language": "6N"});
		assert.equal(Configuration.getLanguage(), "en-GB", "the effective language still should be 'en-GB'");
		assert.equal(Configuration.getLanguageTag(), "en-GB", "the effective language tag still should be 'en-GB'");
		assert.equal(Configuration.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N' already");
		this.setupConfig("de", {"sap-language":"1E"});
		assert.equal(Configuration.getLanguage(), "de", "the effective language still should be 'de'");
		assert.equal(Configuration.getLanguageTag(), "de", "the effective language tag still should be 'de'");
		assert.equal(Configuration.getSAPLogonLanguage(), "1E", "the SAP Logon language should be '6N' already");

		// without the second parameter, the sap language now would be 'EN' only
		Configuration.setLanguage("en-GB");
		assert.equal(Configuration.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(Configuration.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(Configuration.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N'");

		// but with the second parameter, everything should be fine
		Configuration.setLanguage("en-GB", "6N");
		assert.equal(Configuration.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(Configuration.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(Configuration.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N'");

		Configuration.setLanguage("en-GB", "1E");
		assert.equal(Configuration.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(Configuration.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(Configuration.getSAPLogonLanguage(), "1E", "the SAP Logon language should be '1E'");
	});
});
