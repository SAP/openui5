/* global QUnit, sinon */
sap.ui.define([
	"sap/base/config",
	"sap/base/Log",
	"sap/base/i18n/LanguageTag",
	"sap/base/i18n/Localization",
	"sap/base/i18n/date/TimezoneUtils",
	"sap/base/config/GlobalConfigurationProvider",
	"sap/ui/base/config/URLConfigurationProvider"
], function(
	BaseConfig,
	Log,
	LanguageTag,
	Localization,
	TimezoneUtils,
	GlobalConfigurationProvider,
	URLConfigurationProvider
) {
	"use strict";

	var oURLConfigurationProviderStub,
		oGlobalConfigurationProviderStub,
		oSinonSandbox,
		mGlobalConfigStubValues,
		mURLConfigStubValues;

	// Tests within modules are independent but getter test should run first
	// in order to ensure empty writable config
	QUnit.config.reorder = false;

	QUnit.module("Localization getter", {
		beforeEach: function() {
			mURLConfigStubValues = {};
			BaseConfig._.invalidate();
			oSinonSandbox = sinon.createSandbox();
			oSinonSandbox.stub(globalThis.navigator, "languages").value(["en"]);
			oSinonSandbox.spy(Log, "warning");
			oSinonSandbox.spy(Log, "error");
			oURLConfigurationProviderStub = oSinonSandbox.stub(URLConfigurationProvider, "get").callsFake(function(sKey) {
				return mURLConfigStubValues.hasOwnProperty(sKey) ? mURLConfigStubValues[sKey] : oURLConfigurationProviderStub.wrappedMethod.call(this, sKey);
			});
		},
		afterEach: function() {
			oSinonSandbox.restore();
		}
	});

	QUnit.test("getLanguageTag, getLanguage and getSAPLogonLanguage", function(assert) {
		assert.expect(109);
		function fnAssert(mTestOptions) {
			BaseConfig._.invalidate();
			var sSAPLogonLanguage = mTestOptions.SAPLogonLanguage || mTestOptions.language.toUpperCase();
			var sLanguageTag = mTestOptions.languageTag || mTestOptions.language;
			var sPreferredCalendarType = mTestOptions.preferredCalendarType || "Gregorian";
			Log.warning.resetHistory();
			assert.deepEqual(Localization.getLanguageTag(), new LanguageTag(sLanguageTag),
				"getLanguageTag should return locale with stubbed navigator.languages should return a 'sap/base/i18n/LanguageTag' for language '" + sLanguageTag + "'");
			assert.strictEqual(Localization.getLanguage(), mTestOptions.language, "getLanguage should return the localeId as language '" + mTestOptions.language + "'");
			assert.strictEqual(Localization.getLanguageTag().toString(), sLanguageTag, "getLanguageTag should return '" + sLanguageTag + "'");
			assert.strictEqual(Localization.getSAPLogonLanguage(), sSAPLogonLanguage, "getSAPLogonLanguage should return '" + sSAPLogonLanguage + "'");
			assert.strictEqual(Localization.getPreferredCalendarType(), sPreferredCalendarType, "getPreferredCalendarType should return '" + sPreferredCalendarType + "'");
			if (mTestOptions.expectWarning) {
				assert.ok(Log.warning.alwaysCalledWithExactly("sap-language '" + mTestOptions.language + "' is not a valid BCP47 language tag and will only be used as SAP logon language"));
			} else {
				assert.ok(Log.warning.neverCalledWith(sinon.match(/is not a valid BCP47 language tag and will only be used as SAP logon language^/)));
			}
		}
		fnAssert({
			language: "en"
		});

		mURLConfigStubValues = {
			"sapLanguage": "EN"
		};
		fnAssert({
			language: "EN",
			languageTag: "en",
			expectWarning: true
		});

		mURLConfigStubValues = {
			"sapLanguage": "ZH"
		};
		fnAssert({
			language: "zh-Hans",
			SAPLogonLanguage: "ZH"
		});

		mURLConfigStubValues = {
			"sapLanguage": "ZF"
		};
		fnAssert({
			language: "zh-Hant",
			SAPLogonLanguage: "ZF"
		});

		mURLConfigStubValues = {
			"sapLanguage": "1Q"
		};
		fnAssert({
			language: "en-US-x-saptrc",
			SAPLogonLanguage: "1Q"
		});

		mURLConfigStubValues = {
			"sapLanguage": "2Q"
		};
		fnAssert({
			language: "en-US-x-sappsd",
			SAPLogonLanguage: "2Q"
		});

		mURLConfigStubValues = {
			"sapLanguage": "3Q"
		};
		fnAssert({
			language: "en-US-x-saprigi",
			SAPLogonLanguage: "3Q"
		});

		mURLConfigStubValues = {
			"sapLanguage": "6N"
		};
		fnAssert({
			language: "en-GB",
			SAPLogonLanguage: "6N"
		});

		mURLConfigStubValues = {
			"sapLanguage": "6N",
			"sapLocale": "En-gb"
		};
		fnAssert({
			language: "En-gb",
			languageTag: "en-GB",
			SAPLogonLanguage: "6N"
		});

		mURLConfigStubValues = {
			"sapLocale": "fr",
			"sapLanguage": "de",
			"sapUiLanguage": "fa"
		};
		fnAssert({
			language: "fr",
			SAPLogonLanguage: "DE"
		});

		mURLConfigStubValues = {
			"sapLanguage": "de",
			"sapUiLanguage": "fa"
		};
		fnAssert({
			language: "de"
		});

		mURLConfigStubValues = {
			"sapUiLanguage": "fa"
		};
		fnAssert({
			language: "fa",
			preferredCalendarType: "Persian"
		});

		mURLConfigStubValues = {
			"sapLanguage": "de"
		};
		fnAssert({
			language: "de"
		});

		mURLConfigStubValues = {
			"sapLocale": "zh-TW"
		};
		fnAssert({
			language: "zh-TW",
			SAPLogonLanguage: "ZF"
		});

		mURLConfigStubValues = {
			"sapLocale": "sr-Latn-cc-eeeee-f-gg-X-h"
		};
		fnAssert({
			language: "sr-Latn-cc-eeeee-f-gg-X-h",
			languageTag: "sh-CC-eeeee-f-gg-X-h",
			SAPLogonLanguage: "SH"
		});

		mURLConfigStubValues = {
			"sapLanguage": "CT"
		};
		fnAssert({
			language: "cnr",
			SAPLogonLanguage: "CT"
		});

		mURLConfigStubValues = {
			"sapLocale": "cnr-ME"
		};
		fnAssert({
			language: "cnr-ME",
			SAPLogonLanguage: "CT"
		});

		mURLConfigStubValues = {
			"sapLocale": "cnr"
		};
		fnAssert({
			language: "cnr",
			SAPLogonLanguage: "CT"
		});

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapLocale": "1E",
			"sapUiLanguage": "de",
			"sapLanguage": "1E"
		};
		assert.throws(() => {
			Localization.getLanguage();
		}, new TypeError("The given language tag '1E' does not adhere to BCP-47."), "setting an invalid (non-BCP-47) sap-locale should cause an error");
	});

	QUnit.test("getTimezone", function(assert) {
		assert.expect(6);
		oSinonSandbox.stub(TimezoneUtils, "getLocalTimezone").returns("defaultTimezone");
		assert.strictEqual(Localization.getTimezone(), "defaultTimezone", "getTimezone should return 'defaultTimezone' in case no timezone is set via provider");

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapTimezone": "Europe/Berlin",
			"sapUiTimezone": "Europe/Paris"
		};
		assert.strictEqual(Localization.getTimezone(), "Europe/Berlin", "getTimezone should return 'Europe/Berlin'");

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapUiTimezone": "Europe/Paris"
		};
		assert.strictEqual(Localization.getTimezone(), "Europe/Paris", "getTimezone should return 'Europe/Paris'");

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapUiTimezone": "notExistingTimezone"
		};
		assert.ok(Log.error.neverCalledWith("The provided timezone 'notExistingTimezone' is not a valid IANA timezone ID." +
			" Falling back to browser's local timezone 'defaultTimezone'.", "No error for 'notExistingTimezone' should be logged"));
		assert.strictEqual(Localization.getTimezone(), "defaultTimezone", "getTimezone should return 'defaultTimezone' in case invalid timezone is set via provider");
		assert.ok(Log.error.calledOnceWithExactly("The provided timezone 'notExistingTimezone' is not a valid IANA timezone ID." +
			" Falling back to browser's local timezone 'defaultTimezone'."), "Error for 'notExistingTimezone' should be logged");
	});

	QUnit.test("getRTL", function(assert) {
		assert.expect(3);
		assert.strictEqual(Localization.getRTL(), false, "getRTL should return 'false' derived from the locale since 'rtl' was not set via provider.");

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapRtl": false,
			"sapUiRtl": true
		};
		assert.strictEqual(Localization.getRTL(), false, "getRTL should return 'false' derived from parameter 'sapRtl'.");

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapUiRtl": true
		};
		assert.strictEqual(Localization.getRTL(), true, "getRTL should return 'true' derived from parameter 'sapUiRtl'.");
	});

	QUnit.test("getLanguagesDeliveredWithCore", function(assert) {
		assert.deepEqual(Localization.getLanguagesDeliveredWithCore(),
			[
				"", "ar", "bg", "ca", "cnr", "cs", "cy", "da", "de", "el", "en", "en_GB", "es", "es_MX", "et", "fi",
				"fr", "fr_CA", "hi", "hr", "hu", "id", "it", "iw", "ja", "kk", "ko", "lt", "lv", "mk", "ms", "nl", "no",
				"pl", "pt", "pt_PT", "ro", "ru", "sh", "sk", "sl", "sr", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_TW"
			]);
	});

	QUnit.test("getSupportedLanguages", function(assert) {
		assert.expect(3);
		assert.deepEqual(Localization.getSupportedLanguages(), [], "getSupportedLanguages should return '[]'");

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapUiXxSupportedLanguages": ['*']
		};
		assert.deepEqual(Localization.getSupportedLanguages(), [], "getSupportedLanguages should return '[]'");

		oSinonSandbox.stub(Localization, "getLanguagesDeliveredWithCore").returns(["languages", "delivered", "with", "core"]);

		BaseConfig._.invalidate();
		mURLConfigStubValues = {
			"sapUiXxSupportedLanguages": ['default']
		};
		assert.deepEqual(Localization.getSupportedLanguages(), ["languages", "delivered", "with", "core"], "getSupportedLanguages should return '['languages', 'delivered', 'with', 'core']'");
	});

	// Test must be executed before other 'setter' tests because after setLanguage the evaluation order changes
	// for more information see also BCP: 2380121948
	QUnit.module("Localization (BCP: 2380121948 - special language scenario)", {
		beforeEach: (assert) => {
			mURLConfigStubValues = {};
			mGlobalConfigStubValues = { "sapUiLanguage": "de" };
			BaseConfig._.invalidate();
			oSinonSandbox = sinon.createSandbox();
			oSinonSandbox.stub(globalThis.navigator, "languages").value(["en"]);
			oURLConfigurationProviderStub = oSinonSandbox.stub(URLConfigurationProvider, "get").callsFake(function(sKey) {
				return mURLConfigStubValues.hasOwnProperty(sKey) ? mURLConfigStubValues[sKey] : oURLConfigurationProviderStub.wrappedMethod.call(this, sKey);
			});
			oGlobalConfigurationProviderStub = oSinonSandbox.stub(GlobalConfigurationProvider, "get").callsFake(function(sKey) {
				return mGlobalConfigStubValues.hasOwnProperty(sKey) ? mGlobalConfigStubValues[sKey] : oGlobalConfigurationProviderStub.wrappedMethod.call(this, sKey);
			});
		},
		afterEach: () => {
			oSinonSandbox.restore();
		}
	});

	// url: sap-language=en
	// window: language=de
	// ==> en
	// url: sap-language=en&sap-ui-language=de
	// ==> de
	QUnit.test("language via url, locale+language via API", (assert) => {
		assert.expect(15);
		mURLConfigStubValues = {"sapLanguage": "6N"};
		assert.equal(Localization.getLanguage(), "en-GB", "the effective language still should be 'en-GB'");
		assert.equal(Localization.getLanguageTag(), "en-GB", "the effective language tag still should be 'en-GB'");
		assert.equal(Localization.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N' already");

		BaseConfig._.invalidate();
		mURLConfigStubValues = {"sapLanguage": "1E"};
		assert.equal(Localization.getLanguage(), "de", "the effective language still should be 'de'");
		assert.equal(Localization.getLanguageTag(), "de", "the effective language tag still should be 'de'");
		assert.equal(Localization.getSAPLogonLanguage(), "1E", "the SAP Logon language should be '6N' already");

		// without the second parameter, the sap language now would be 'EN' only
		Localization.setLanguage("en-GB");
		assert.equal(Localization.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(Localization.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(Localization.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N'");

		// but with the second parameter, everything should be fine
		Localization.setLanguage("en-GB", "6N");
		assert.equal(Localization.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(Localization.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(Localization.getSAPLogonLanguage(), "6N", "the SAP Logon language should be '6N'");

		Localization.setLanguage("en-GB", "1E");
		assert.equal(Localization.getLanguage(), "en-GB", "the effective language should be 'en-GB'");
		assert.equal(Localization.getLanguageTag(), "en-GB", "the effective language tag should be 'en-GB'");
		assert.equal(Localization.getSAPLogonLanguage(), "1E", "the SAP Logon language should be '1E'");
	});

	QUnit.module("Localization setter and 'change' events", {
		beforeEach: function() {
			mURLConfigStubValues = {};
			oSinonSandbox = sinon.createSandbox();
			Localization.setLanguage("en");
			Localization.setTimezone(null);
		},
		afterEach: function() {
			oSinonSandbox.restore();
		}
	});

	QUnit.test("setLanguage", function(assert) {
		assert.expect(29);
		var sExpectedLanguageTag, sExpectedLanguage, sExpectedSAPLogonLanguage, bExpectedRtl = false, bOldRtl = Localization.getRTL();
		function localizationChanged(oEvent) {
			assert.strictEqual(Localization.getLanguageTag().toString(), sExpectedLanguageTag, "Should return expected LanguageTag '" + sExpectedLanguageTag + "'");
			assert.strictEqual(Localization.getLanguage(), sExpectedLanguage || sExpectedLanguageTag, "Should return expected LanguageTag '" + sExpectedLanguage || sExpectedLanguageTag + "'");
			assert.strictEqual(Localization.getSAPLogonLanguage(), sExpectedSAPLogonLanguage || sExpectedLanguageTag.toUpperCase(), "Should return expected SAPLogonLanguage '" + sExpectedSAPLogonLanguage || sExpectedLanguageTag.toUpperCase() + "'");
			assert.strictEqual(Localization.getRTL(), bExpectedRtl, "Should return expected rtl '" + bExpectedRtl + "'");
			assert.strictEqual(oEvent.language, sExpectedLanguageTag, "Change event should contain the correct language '" + sExpectedLanguageTag + "'");
			if (bExpectedRtl !== bOldRtl) {
				assert.strictEqual(oEvent.rtl, bExpectedRtl, "Change event should contain the correct rtl '" + sExpectedLanguageTag + "'");
				bOldRtl = oEvent.rtl;
			}
		}
		Localization.attachChange(localizationChanged);
		sExpectedLanguageTag = "de";
		Localization.setLanguage(sExpectedLanguageTag);

		sExpectedSAPLogonLanguage = "DE";
		sExpectedLanguageTag = "de-CH";
		Localization.setLanguage(sExpectedLanguageTag);

		sExpectedSAPLogonLanguage = "EN";
		sExpectedLanguageTag = "en-US";
		sExpectedLanguage = "en_US";
		Localization.setLanguage(sExpectedLanguage);

		sExpectedLanguage = sExpectedSAPLogonLanguage = undefined;
		sExpectedLanguageTag = "fa";
		bExpectedRtl = true;
		Localization.setLanguage(sExpectedLanguageTag);
		// Setting same language again shouldn't trigger a change event
		Localization.setLanguage(sExpectedLanguageTag);

		sExpectedLanguageTag = "en";
		sExpectedSAPLogonLanguage = "US";
		bExpectedRtl = false;
		Localization.setLanguage(sExpectedLanguageTag, sExpectedSAPLogonLanguage);

		assert.throws(function() {
			Localization.setLanguage("invalidLanguage");
		}, "Using setLanguage with invalid first parameter should throw an error");

		assert.throws(function() {
			Localization.setLanguage("en", "invalidSAPLogonLanguage");
		}, "Using setLanguage with invalid second parameter should throw an error");

		Localization.detachChange(localizationChanged);
	});

	QUnit.test("setTimezone", function(assert) {
		assert.expect(5);
		var sExpectedTimezone;
		oSinonSandbox.stub(TimezoneUtils, "getLocalTimezone").returns("defaultTimezone");
		function localizationChanged(oEvent) {
			assert.strictEqual(Localization.getTimezone(), sExpectedTimezone, "Should return expected LanguageTag '" + sExpectedTimezone + "'");
			assert.strictEqual(oEvent.timezone, sExpectedTimezone, "Change event should contain the correct LanguageTag '" + sExpectedTimezone + "'");
		}
		Localization.attachChange(localizationChanged);

		sExpectedTimezone = "Europe/Berlin";
		Localization.setTimezone(sExpectedTimezone);
		// Setting same timezone again shouldn't trigger a change event
		Localization.setTimezone(sExpectedTimezone);

		sExpectedTimezone = "defaultTimezone";
		Localization.setTimezone(null);

		assert.throws(function() {
			Localization.setTimezone(true);
		}, "Using setTimezone with invalid parameter should throw an error");

		Localization.detachChange(localizationChanged);
	});

	QUnit.test("setRTL", function(assert) {
		assert.expect(4);
		var bOldRtl = Localization.getRTL(), bExpectedRtl;
		function localizationChanged(oEvent) {
			assert.strictEqual(Localization.getRTL(), bExpectedRtl, "Should return expected LanguageTag '" + bExpectedRtl + "'");
			assert.strictEqual(oEvent.rtl, bExpectedRtl, "Change event should contain the correct LanguageTag '" + bExpectedRtl + "'");
			bOldRtl = oEvent.rtl;
		}
		Localization.attachChange(localizationChanged);

		bExpectedRtl = !bOldRtl;
		Localization.setRTL(bExpectedRtl);
		// Setting same rtl again shouldn't trigger a change event
		Localization.setRTL(bExpectedRtl);

		bExpectedRtl = !bOldRtl;
		Localization.setRTL(null);

		Localization.detachChange(localizationChanged);
	});
});