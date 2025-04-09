/*global QUnit */
sap.ui.define([
	"sap/base/i18n/LanguageFallback",
	"sap/base/Log"
], function(LanguageFallback, Log) {
	"use strict";

    QUnit.module("sap/base/i18n/LanguageFallback", {
		beforeEach: function() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},
		afterEach: function() {
			this.oLogMock.restore();
		}
	});

    QUnit.test("getFallbackLocales", function (assert) {
		var aSupportedLocales = ['en', 'es', 'fr', 'zh_CN', 'zh_TW'];
		assert.deepEqual(LanguageFallback.getFallbackLocales('de-CH'), ['de_CH', 'de', 'en', ''], "fallback chain without knowledge about supported locales");
		assert.deepEqual(LanguageFallback.getFallbackLocales('de-CH', aSupportedLocales), ['en'], "fallback chain with knowledge about supported locales");
		assert.deepEqual(LanguageFallback.getFallbackLocales('zh-HK', aSupportedLocales), ['zh_TW', 'en'], "fallback for zh-HK");
		assert.deepEqual(LanguageFallback.getFallbackLocales('zh_HK', aSupportedLocales), ['zh_TW', 'en'], "fallback for zh_HK");

		assert.deepEqual(LanguageFallback.getFallbackLocales('de', aSupportedLocales), ['en'], "default fallbackLocale supported");
		assert.deepEqual(LanguageFallback.getFallbackLocales('es', aSupportedLocales), ['es', 'en'], "fallback for es");

		this.oLogMock.expects("error").withExactArgs(
			"The fallback locale 'en' is not contained in the list of supported locales ['fr'] " +
			"and will be ignored."
		);
		assert.deepEqual(LanguageFallback.getFallbackLocales('de', ['fr']), [], "nothing supported");

		this.oLogMock.expects("error").withExactArgs(
			"The fallback locale 'en' is not contained in the list of supported locales ['fr', 'es'] " +
			"and will be ignored."
		);
		assert.deepEqual(LanguageFallback.getFallbackLocales('es', ['fr', 'es']), ['es'], "fallback for es");

		assert.deepEqual(LanguageFallback.getFallbackLocales('zh-CN', ['zh_CN', 'zh'], 'zh'), ['zh_CN', 'zh'], "fallback for zh_CN");
		assert.deepEqual(LanguageFallback.getFallbackLocales('zh-CN', ['zh-CN', 'zh'], 'zh'), ['zh_CN', 'zh'], "fallback for zh_CN");

		assert.deepEqual(LanguageFallback.getFallbackLocales('zh', ['zh-CN', 'zh', 'zh-TW'], 'zh_TW'), ['zh', 'zh_TW'], "fallback for zh");
		assert.deepEqual(LanguageFallback.getFallbackLocales('zh', ['zh-CN', 'zh', 'zh-TW'], 'zh-TW'), ['zh', 'zh_TW'], "fallback for zh");
		assert.deepEqual(LanguageFallback.getFallbackLocales('zh-CN', ['zh_CN', 'zh', 'zh_TW'], 'zh_TW'), ['zh_CN', 'zh', 'zh_TW'], "fallback for zh_CN (no duplicates)");
		assert.deepEqual(LanguageFallback.getFallbackLocales('zh-CN', ['zh_CN', 'zh', 'zh_TW'], 'zh'), ['zh_CN', 'zh'], "fallback for zh_CN");
	});

	QUnit.test("getFallbackLocales fallbackLocale not contained", function (assert) {
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('zh-CN', ['zh_CN', 'zh'], 'zh_TW');
		}, new Error("The fallback locale 'zh_TW' is not contained in the list of supported locales ['zh_CN', 'zh'] and will be ignored."));

		assert.throws(function () {
			LanguageFallback.getFallbackLocales('zh-CN', ['zh-CN', 'zh'], 'zh_TW');
		}, new Error("The fallback locale 'zh_TW' is not contained in the list of supported locales ['zh_CN', 'zh'] and will be ignored."));
	});

	QUnit.test("getFallbackLocales (with modern ISO639 language code)", function (assert) {
		var aSupportedLocales = ['he', 'id', 'en'];
		assert.deepEqual(LanguageFallback.getFallbackLocales('iw-IL'), ['iw_IL', 'iw', 'en', ''], "fallback chain without knowledge about supported locales");
		assert.deepEqual(LanguageFallback.getFallbackLocales('iw-IL', aSupportedLocales), ['he', 'en'], "fallback chain with knowledge about supported locales");
		assert.deepEqual(LanguageFallback.getFallbackLocales('id'), ['id', 'en', ''], "fallback chain without knowledge about supported locales");
		assert.deepEqual(LanguageFallback.getFallbackLocales('id', aSupportedLocales), ['id', 'en'], "fallback chain with knowledge about supported locales");

		// hebrew modern: "he"
		// hebrew legacy: "iw"
		assert.deepEqual(LanguageFallback.getFallbackLocales('he_IL', ['iw'], 'iw'), ['iw'], "fallback for he_IL");
		assert.deepEqual(LanguageFallback.getFallbackLocales('he_IL', ['he'], 'he'), ['he'], "fallback for he_IL");
		assert.deepEqual(LanguageFallback.getFallbackLocales('he_IL', ['iw_IL'], 'iw_IL'), ['iw_IL'], "fallback for he_IL");
		assert.deepEqual(LanguageFallback.getFallbackLocales('he_IL', ['he_IL'], 'he_IL'), ['he_IL'], "fallback for he_IL");

		assert.deepEqual(LanguageFallback.getFallbackLocales('iw_IL', ['iw'], 'iw'), ['iw'], "fallback for iw_IL");
		assert.deepEqual(LanguageFallback.getFallbackLocales('iw_IL', ['he'], 'he'), ['he'], "fallback for iw_IL");
		assert.deepEqual(LanguageFallback.getFallbackLocales('iw_IL', ['iw_IL'], 'iw_IL'), ['iw_IL'], "fallback for iw_IL");
		assert.deepEqual(LanguageFallback.getFallbackLocales('iw_IL', ['he_IL'], 'he_IL'), ['he_IL'], "fallback for iw_IL");

		assert.deepEqual(LanguageFallback.getFallbackLocales('iw', ['iw'], 'iw'), ['iw'], "fallback for iw");
		assert.deepEqual(LanguageFallback.getFallbackLocales('he', ['he'], 'iw'), ['he'], "fallback for he");
		assert.deepEqual(LanguageFallback.getFallbackLocales('iw', ['iw_IL'], 'he_IL'), ['iw_IL'], "fallback for iw");
		assert.deepEqual(LanguageFallback.getFallbackLocales('he', ['he_IL'], 'iw_IL'), ['he_IL'], "fallback for he");
	});

	QUnit.test("getFallbackLocales (with modern ISO639 language code) not contained", function (assert) {
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('he_IL', ['iw'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw'] and will be ignored."));
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('he_IL', ['he'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he'] and will be ignored."));
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('he_IL', ['iw_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw_IL'] and will be ignored."));
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('he_IL', ['he_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he_IL'] and will be ignored."));


		assert.throws(function () {
			LanguageFallback.getFallbackLocales('iw_IL', ['iw'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw'] and will be ignored."));
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('iw_IL', ['he'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he'] and will be ignored."));
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('iw_IL', ['iw_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw_IL'] and will be ignored."));
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('iw_IL', ['he_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he_IL'] and will be ignored."));

		assert.throws(function () {
			LanguageFallback.getFallbackLocales('iw', ['iw'], 'he_IL');
		}, new Error("The fallback locale 'iw_IL' is not contained in the list of supported locales ['iw'] and will be ignored."));
		assert.throws(function () {
			LanguageFallback.getFallbackLocales('he', ['he'], 'iw_IL');
		}, new Error("The fallback locale 'iw_IL' is not contained in the list of supported locales ['he'] and will be ignored."));
	});
});
