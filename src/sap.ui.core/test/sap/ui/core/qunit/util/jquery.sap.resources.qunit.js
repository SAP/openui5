/* global QUnit, sinon */

sap.ui.define([
	"jquery.sap.resources",
	"sap/base/i18n/ResourceBundle",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/Properties"
], function (jQuery, ResourceBundle, LoaderExtensions, Properties) {
	"use strict";


	QUnit.module("fallback", {
		beforeEach: function () {
			this.oPropertiesCreateStub = this.stub(Properties, "create").returns({
				getProperty: function () {}
			});
		}
	});

	QUnit.test("check expected sequences", function (assert) {
		var checkSequence = function(sLocale, aExpected) {
			// ask for a bundle with a well known name
			var oBundle = ResourceBundle.create({ url: "dummy.properties", locale: sLocale });

			// and for a text in it
			oBundle.getText("DUMMY_KEY");
			// oBundle.aLocales contains the locales calculated by the fallback chain
			assert.deepEqual(oBundle.aLocales, aExpected, "locale fallback should match for '" + sLocale + "'");
		};

		// simple test
		checkSequence("de", ["de", "en", ""]);
		// ensure that en is not requested twice
		checkSequence("en", ["en", ""]);
		// simple case with region
		checkSequence("de-CH", ["de_CH", "de", "en", ""]);
		// underscore instead of dash
		checkSequence("fr_CH", ["fr_CH", "fr", "en", ""]);
		// JDK like language, region and variant
		checkSequence("en_EN_Geekish", ["en_EN_Geekish", "en_EN", "en", ""]);
		// special case Hong Kong, should fallback to Taiwan
		checkSequence("zh_HK", ["zh_HK", "zh_TW", "zh", "en", ""]);
		// special case BCP47 tag with private extension for 1Q/saptrc, must always map to en-US and variant saptrc
		checkSequence("es-ES-x-saptrc", ["en_US_saptrc", "en_US", "en", ""]);
		// special case BCP47 tag with private extension for 2Q/sappsd, must always map to en-US and variant sappsd
		checkSequence("es-ES-x-sappsd", ["en_US_sappsd", "en_US", "en", ""]);
		// special case BCP47 tag with private extension for 3Q/saprigi, must always map to en-US and variant saprigi
		checkSequence("es-ES-x-saprigi", ["en_US_saprigi", "en_US", "en", ""]);
		// special case BCP47 tag with variant for 1Q/saptrc, must always map to en-US and variant saptrc
		checkSequence("es-ES-saptrc", ["en_US_saptrc", "en_US", "en", ""]);
		// special case BCP47 tag with variant for 2Q/sappsd, must always map to en-US and variant sappsd
		checkSequence("es-ES-sappsd", ["en_US_sappsd", "en_US", "en", ""]);
		// special case BCP47 tag with variant for 3Q/saprigi, must always map to en-US and variant saprigi
		checkSequence("es-ES-saprigi", ["en_US_saprigi", "en_US", "en", ""]);
	});

	function loadBundle(assert, mParams, fnDoWhenLoaded) {
		var oRes = ResourceBundle.create(mParams);

		if (!mParams.async) {
			fnDoWhenLoaded(assert, oRes);
		} else {
			// Note: if multiple async calls are not chained, each one has to block QUnit with its own semaphore!
			var done = assert.async();
			oRes.then(function (mParams) {
				fnDoWhenLoaded(assert, mParams);
			}).then(done, done);
		}
	}

	QUnit.test("jQuery.sap.resource code available", function (assert) {
		assert.ok(jQuery.sap.resources, "jQuery.sap.resources must exist");
		assert.equal(typeof jQuery.sap.resources, "function", "jQuery.sap.resources must be a function");
	});

	QUnit.test("Resources Available", function (assert) {
		// legacy API test
		assert.equal(typeof jQuery.sap.resources, "function", "jQuery.sap.resources must be a function");
	});

	QUnit.module(".properties files");

	function testAccessAndParsing(assert, oProps) {
		var sValue = oProps.getText("transkey5");
		assert.equal(sValue, "Test Text 1 zh_HK", "transkey5 accessed");
		sValue = oProps.getText("transkey4");
		assert.equal(sValue, "Test Text 1 zh_TW", "transkey4 accessed");
		sValue = oProps.getText("transkey2");
		assert.equal(sValue, "Test Text 2 en", "transkey2 accessed");
		sValue = oProps.getText("transkey1");
		assert.equal(sValue, "Test Text 1 Fallback", "transkey1 accessed");

		sValue = oProps.getText("emptykey");
		assert.equal(sValue, "", "emptykey accessed");
		sValue = oProps.getText("nonexistingkey");
		assert.equal(sValue, "nonexistingkey", "nonexistingkey accessed");
	}

	QUnit.test("access and parsing (sync)", function (assert) {
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: "zh_HK"
		}, testAccessAndParsing);
	});

	QUnit.test("access and parsing (async)", function (assert) {
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: "zh_HK",
			async: true
		}, testAccessAndParsing);
	});

	function testFallbackForInvalidLocales(assert, oProps) {
		var sValue = oProps.getText("transkey1");
		assert.equal(sValue, "Test Text 1 Fallback", "transkey1 accessed");
	}

	QUnit.test("fallback for invalid locales (sync)", function (assert) {
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: "0815"
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: ""
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: undefined
		}, testFallbackForInvalidLocales);
	});

	QUnit.test("fallback for invalid locales (async)", function (assert) {
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: "0815",
			async: true
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: "",
			async: true
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.properties"),
			locale: undefined,
			async: true
		}, testFallbackForInvalidLocales);
	});

	QUnit.test("origin info", function (assert) {
		var oProps = ResourceBundle.create({
			url: "testdata/resources/bundle.properties",
			locale: "en",
			includeInfo: true
		});
		var sValue = oProps.getText("transkey2"),
			oInfo = sValue.originInfo;
		assert.equal(oInfo.source, "Resource Bundle", "Origin Info: source");
		assert.equal(oInfo.url, "testdata/resources/bundle.properties", "Origin Info: url");
		assert.equal(oInfo.locale, "en", "Origin Info: locale");
		assert.equal(oInfo.key, "transkey2", "Origin Info: key");
	});

	QUnit.module(".hdbtextbundle files");

	QUnit.test("access and parsing", function (assert) {
		// redirect access to URL + Accept header to files with language specific texts
		this.stub(LoaderExtensions, "loadResource").callsFake(function (sResourceName, mOptions) {
			if (typeof sResourceName === 'object') {
				mOptions = sResourceName;
				sResourceName = undefined;
			}
			if (mOptions && mOptions.url === 'testdata/resources/bundle.hdbtextbundle') {
				var sLocale = mOptions.headers && mOptions.headers['Accept-Language'];
				var sResource = sap.ui.require.toUrl('testdata/resources/bundle') + (sLocale !== "*" ? "_" + sLocale.replace('-', '_') : '') + '.hdbtextbundle';
				var sResult;
				jQuery.ajax({
					url: sResource,
					dataType: 'text',
					async: false,
					success: function (data) {
						sResult = data;
					}
				});
				return sResult;
			}
			throw new Error();
		});
		var oProps = ResourceBundle.create({ url: "testdata/resources/bundle.hdbtextbundle", locale: "zh_HK" });
		assert.equal(oProps.getText("transkey5"), "Test Text 1 zh_HK", "transkey5 accessed");
		assert.equal(oProps.getText("transkey4"), "Test Text 1 zh_TW", "transkey4 accessed");
		assert.equal(oProps.getText("transkey2"), "Test Text 2 en", "transkey2 accessed");
		assert.equal(oProps.getText("transkey1"), "Test Text 1 Fallback", "transkey1 accessed");
	});

	QUnit.test("fallback for invalid locales (sync)", function (assert) {
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.hdbtextbundle"),
			locale: "0815"
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.hdbtextbundle"),
			locale: ""
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.hdbtextbundle"),
			locale: undefined
		}, testFallbackForInvalidLocales);
	});

	QUnit.test("fallback for invalid locales (async)", function (assert) {
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.hdbtextbundle"),
			locale: "0815",
			async: true
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.hdbtextbundle"),
			locale: "",
			async: true
		}, testFallbackForInvalidLocales);
		loadBundle(assert, {
			url: sap.ui.require.toUrl("testdata/resources/bundle.hdbtextbundle"),
			locale: undefined,
			async: true
		}, testFallbackForInvalidLocales);
	});

	QUnit.test("origin info", function (assert) {
		var oProps = ResourceBundle.create({
			url: "testdata/resources/bundle.hdbtextbundle",
			locale: "en",
			includeInfo: true
		});
		var sValue = oProps.getText("transkey2"),
			oInfo = sValue.originInfo;
		assert.equal(oInfo.source, "Resource Bundle", "Origin Info: source");
		assert.equal(oInfo.url, "testdata/resources/bundle.hdbtextbundle", "Origin Info: url");
		assert.equal(oInfo.locale, "en", "Origin Info: locale");
		assert.equal(oInfo.key, "transkey2", "Origin Info: key");
	});

	QUnit.module("negative tests");

	QUnit.test("type with query params and/or hash", function (assert) {
		assert.expect(3);
		try {
			ResourceBundle.create({ url: "testdata/resources/bundle.properties?version=2" });
			assert.ok(true, "no exception must occur");
		} catch (e) {
			assert.ok(false, "no exception must occur");
		}
		try {
			ResourceBundle.create({ url: "testdata/resources/bundle.properties#2" });
			assert.ok(true, "no exception must occur");
		} catch (e) {
			assert.ok(false, "no exception must occur");
		}
		try {
			ResourceBundle.create({ url: "testdata/resources/bundle.properties?version=2#2" });
			assert.ok(true, "no exception must occur");
		} catch (e) {
			assert.ok(false, "no exception must occur");
		}
	});

	QUnit.test("invalid file types", function (assert) {
		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle" });
		}, "Sync: URL without file extension should raise an exception");

		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle", async: true });
		}, "Async: URL without file extension should raise an exception");
	});

	QUnit.test("unsupported type (sync)", function (assert) {
		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json" });
		}, "Sync: URL with invalid file extension should raise an exception");

		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json", async: true });
		}, "Async: URL with invalid file extension should raise an exception");
	});

	QUnit.test("supported type after query", function (assert) {
		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json?.properties" });
		}, "Sync: URL with invalid file extension should raise an exception");

		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json?.properties", async: true });
		}, "Async: URL with invalid file extension should raise an exception");
	});

	QUnit.test("supported type after hash", function (assert) {
		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json#.properties" });
		}, "Sync: URL with invalid file extension should raise an exception");

		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json#.properties", async: true });
		}, "Async: URL with invalid file extension should raise an exception");
	});

	QUnit.test("supported type after query and hash", function (assert) {
		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json?test=true#.properties" });
		}, "Sync: URL with invalid file extension should raise an exception");

		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources/bundle.json?test=true#.properties", async: true });
		}, "Async: URL with invalid file extension should raise an exception");
	});

	QUnit.test("unexpected position of known type", function (assert) {
		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources.properties/bundle" });
		}, "Sync: URL with misplaced file extension should raise an exception");

		assert.raises(function () {
			ResourceBundle.create({ url: "testdata/resources.properties/bundle", async: true });
		}, "Async: URL with misplaced file extension should raise an exception");

	});

	QUnit.module("other");

	QUnit.test("enhancement", function (assert) {
		var oBundle = ResourceBundle.create({ url: sap.ui.require.toUrl("testdata/messages.properties") });
		assert.equal(oBundle.getText("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(oBundle.getText("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
		var oCustomBundle = ResourceBundle.create({ url: sap.ui.require.toUrl("testdata/messages_custom.properties") });
		oBundle._enhance(oCustomBundle);
		assert.equal(oBundle.getText("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(oBundle.getText("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
	});

	QUnit.module("hasText", {
		beforeEach: function () {
			this.server = sinon.fakeServer.create();
			this.server.respondWith(/fake(?:_en)?.properties/, function (xhr) {
				xhr.respond(200, {}, "key=value");
			});
			this.server.autoRespond = true;
		},
		afterEach: function () {
			this.server.restore();
		}
	});

	QUnit.test("hasText (sync)", function (assert) {
		var oBundle = ResourceBundle.create({ url: "fake.properties", locale: 'en' });
		assert.ok(oBundle.hasText("key"), "hasText should return true for key 'key'");
		assert.notOk(oBundle.hasText("non_existing_key"), "hasText should return false for key 'non_existing_key'");
		assert.deepEqual(oBundle.aLocales, ['en'], "only a single locale should have been loaded");
	});

	QUnit.test("hasText (async)", function (assert) {
		var oPromise = ResourceBundle.create({ url: "fake.properties", locale: 'en', async: true });

		return oPromise.then(function (oBundle) {
			assert.ok(oBundle.hasText("key"), "hasText should return true for key 'key'");
			assert.notOk(oBundle.hasText("non_existing_key"), "hasText should return false for key 'non_existing_key'");
			assert.deepEqual(oBundle.aLocales, ['en'], "only a single locale should have been loaded");
		});
	});

	QUnit.test("hasText (initial locale does not exist - sync)", function (assert) {
		var oBundle = ResourceBundle.create({ url: "fake.properties", locale: 'en-US' });
		assert.ok(oBundle.hasText("key"), "hasText should know about key 'key' even if no properties file for the initial locale exists");
		assert.notOk(oBundle.hasText("non_existing_key"), "hasText should return false for key 'non_existing_key'");
		assert.deepEqual(oBundle.aLocales, ['en'], "only a single locale should have been loaded");
	});

	QUnit.test("hasText (initial locale does not exist - async)", function (assert) {
		var oPromise = ResourceBundle.create({ url: "fake.properties", locale: 'en-US', async: true });
		return oPromise.then(function (oBundle) {
			assert.ok(oBundle.hasText("key"), "hasText should return true for key 'key'");
			assert.notOk(oBundle.hasText("non_existing_key"), "hasText should return false for key 'non_existing_key'");
			assert.deepEqual(oBundle.aLocales, ['en'], "only a single locale should have been loaded");
		});
	});

	QUnit.module("private functions");

	QUnit.test("_getFallbackLocales", function (assert) {
		var aSupportedLocales = ['en', 'es', 'fr', 'zh_CN', 'zh_TW'];
		assert.deepEqual(ResourceBundle._getFallbackLocales('de-CH'), ['de_CH', 'de', 'en', ''], "fallback chain without knowledge about supported locales");
		assert.deepEqual(ResourceBundle._getFallbackLocales('de-CH', aSupportedLocales), ['en'], "fallback chain with knowledge about supported locales");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh-HK', aSupportedLocales), ['zh_TW', 'en'], "fallback for zh-HK");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh_HK', aSupportedLocales), ['zh_TW', 'en'], "fallback for zh_HK");
	});

});
