/*global QUnit */
sap.ui.define([
	"sap/ui/core/Locale"
], function(Locale) {
	"use strict";

	var aLocales = [
		["en",						"en",		null,	null,	null,			null,			null,		"EN"],
		["en-US",					"en",		null,	"US",	null,			null,			null,		"EN"],
		["es-419",					"es",		null,	"419",	null,			null,			null,		"ES"],
		["zh-Hans",					"zh",		"Hans",	null,	null,			null,			null,		"ZH"],
		["zh-yue",					"zh-yue",	null,	null,	null,			null,			null,		"ZH"],
		["az-Latn",					"az",		"Latn",	null,	null,			null,			null,		"AZ"],
		["zh-Hant-HK",				"zh",		"Hant",	"HK",	null,			null,			null,		"ZF"],
		["sl-IT-nedis",				"sl",		null,	"IT",	"nedis",		null,			null,		"SL"], // single variant of the form "5*8alphanum"
		["de-CH-1901",				"de",		null,	"CH",	"1901",			null,			null,		"DE"], // single variant of the form "DIGIT 3alphanum"
		["sl-IT-nedis-0815",		"sl",		null,	"IT",	"nedis-0815",	null,			null,		"SL"], // multiple variants
		["sl-IT-var0815",			"sl",		null,	"IT",	"var0815",		null,			null,		"SL"], // single variant of the form "5*8alphanum", mix of alpha and num
		["de-DE-u-co-phonebk",		"de",		null,	"DE",	null,			"u-co-phonebk",	null,		"DE"], // multiple extensions after same singleton
		["de-DE-u-co-i-kl",			"de",		null,	"DE",	null,			"u-co-i-kl",	null,		"DE"], // multiple extensions with different singletons
		["en-US-x-twain",			"en",		null,	"US",	null,			null,			"x-twain",	"EN"],

		// additional tests for normalization
		["en_US",					"en",		null,	"US",	null,			null,			null,		"EN"],
		["EN-US",					"en",		null,	"US",	null,			null,			null,		"EN"],
		["en-us",					"en",		null,	"US",	null,			null,			null,		"EN"],
		["zh_hant_hk",				"zh",		"Hant",	"HK",	null,			null,			null,		"ZF"],

		// additional tests for SAP Logon Language
		["en-x-saptrc",				"en",		null,	null,	null,			null,			"x-saptrc",	"1Q"],
		["EN-X-sAptRc",				"en",		null,	null,	null,			null,			"X-sAptRc",	"1Q"],
		["en-x-sappsd",				"en",		null,	null,	null,			null,			"x-sappsd",	"2Q"],
		["de-CH-x-sapufmt-sappsd",	"de",		null,	"CH",	null,			null,			"x-sapufmt-sappsd",	"2Q"],
		["iw-IL",					"iw",		null,	"IL",	null,			null,			null,		"HE"],
		["zz",						"zz",		null,	null,	null,			null,			null,		"ZZ"] // unknown language
	];

	function localeTest(sLocale, sLanguage, sScript, sRegion, sVariant, sExtension, sPrivateUse) {
		QUnit.test("Locale " + sLocale, function(assert) {
			var oLocale = new Locale(sLocale);
			assert.equal(oLocale.getLanguage(), sLanguage, "Language");
			assert.equal(oLocale.getScript(), sScript, "Script");
			assert.equal(oLocale.getRegion(), sRegion, "Region");
			assert.equal(oLocale.getVariant(), sVariant, "Variant");
			assert.equal(oLocale.getExtension(), sExtension, "Extension");
			assert.equal(oLocale.getPrivateUse(), sPrivateUse, "PrivateUse");
		});
	}

	aLocales.forEach(function(aLocaleData) {
		localeTest.apply(this, aLocaleData);
	});

	QUnit.test("hasPrivateUseSubtag", function(assert) {
		var oLocale = new Locale("de_DE-x-sapufmt");
		assert.equal(oLocale.getPrivateUse(), "x-sapufmt", "PrivateUse must be set");
		assert.equal(oLocale.hasPrivateUseSubtag("sapufmt"), true, "PrivateUse subtag must be detected");
		assert.equal(oLocale.hasPrivateUseSubtag("sap"), false, "parts of PrivateUse subtag must not be detected");
		assert.equal(oLocale.hasPrivateUseSubtag("apu"), false, "parts of PrivateUse subtag must not be detected");
		assert.equal(oLocale.hasPrivateUseSubtag("ufmt"), false, "parts of PrivateUse subtag must not be detected");
	});

	QUnit.test("SAPLogonLanguage", function(assert) {
		aLocales.forEach(function(aLocaleData) {
			var oLocale = new Locale(aLocaleData[0]);
			assert.equal(oLocale.getSAPLogonLanguage(), aLocaleData[7], "locale should return the correct SAP Logon Language");
		});
	});
});
