/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/i18n/ResourceBundle",
	"sap/base/util/Properties",
	"sap/base/util/merge",
	"sap/base/Log"
], function(Localization, ResourceBundle, Properties, merge, Log) {
	"use strict";

	QUnit.module("sap/base/i18n/ResourceBundle", {
		afterEach: function() {
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("create invalid url", function(assert) {
		assert.throws(ResourceBundle.create, new Error("resource URL '' has unknown type (should be one of .properties,.hdbtextbundle)"), "creation fails without valid url");
	});

	QUnit.test("create", function(assert) {
		var oEmptyProps = createFakeProperties({number: "47"});

		this.stub(Properties, "create").returns(Promise.resolve(oEmptyProps));

		// Uses default locale as defined in testsuite.i18n.qunit.js
		return ResourceBundle.create({url: 'my.properties', async: true}).then(function(oResourceBundle) {
			assert.ok(oResourceBundle instanceof ResourceBundle);
			assert.deepEqual(oResourceBundle.aPropertyFiles[0], oEmptyProps, "properties are correctly loaded");
			assert.equal(Properties.create.callCount, 1, "Properties.create should be called once");
			assert.deepEqual(Properties.create.getCall(0).args, [{
				async: true,
				headers: undefined,
				returnNullIfMissing: true,
				url: "my_en_US.properties"
			}], "Properties.create should be called with expected arguments");
		});
	});

	function createFakeProperties(obj, oCallStub) {
		return {
			getProperty: function(sKey) {
				if (oCallStub) {
					oCallStub(obj);
				}
				return obj[sKey];
			}
		};
	}

	function createFakePropertiesPromise(obj, oCallStub) {
		return Promise.resolve(createFakeProperties(obj, oCallStub));
	}

	/**
	 *
	 * @param sandbox
	 * @return {*} ResourceBundle containing CustomBundle1 and CustomBundle2
	 */
	function createResourceBundleWithCustomBundles(sandbox) {
		var oStub = sandbox.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		var oResourceBundle1;
		var oResourceBundleCustom1;
		var oResourceBundleCustom2;
		return ResourceBundle.create({url: 'my.properties', locale: "en", async: true})
		.then(function(oResourceBundle) {
			oResourceBundle1 = oResourceBundle;
			oStub.returns(createFakePropertiesPromise({number: "45", mec1: "ya"}));

			return ResourceBundle.create({url: 'custom1.properties', locale: "en", async: true});
		})
		.then(function(oResourceBundle) {
			oResourceBundleCustom1 = oResourceBundle;
			oStub.returns(createFakePropertiesPromise({number: "46", mec2: "ye"}));

			return ResourceBundle.create({url: 'custom2.properties', locale: "en", async: true});
		})
		.then(function(oResourceBundle) {
			oResourceBundleCustom2 = oResourceBundle;
			oResourceBundle1._enhance(oResourceBundleCustom1);
			oResourceBundle1._enhance(oResourceBundleCustom2);
			oStub.restore();
			return oResourceBundle1;
		});
	}

	QUnit.test("_recreate (async instance)", function(assert) {
		return ResourceBundle.create({
			"async": true,
			"bundleUrl": "i18n/i18n.properties"
		}).then(function(oResourceBundle1) {
			return oResourceBundle1._recreate().then(function(oResourceBundle2) {
				assert.ok(oResourceBundle2 instanceof ResourceBundle, "recreate should resolve with ResourceBundle");
				assert.notEqual(oResourceBundle1, oResourceBundle2, "recreate should not resolve with same instance");
				assert.deepEqual(oResourceBundle1, oResourceBundle2, "recreate should resolve with equal ResourceBundle as new instance");
			});
		});
	});

	QUnit.test("_recreate (async instance, with enhanceWith)", function(assert) {
		return ResourceBundle.create({
			"async": true,
			"includeInfo": false,
			"locale": "en-US",
			"enhanceWith": [
				{
					"bundleUrl": "enhance/i18n/i18n.properties",
					"supportedLocales": [""],
					"fallbackLocale": "",
					"bundleUrlRelativeTo": "manifest"
				}
			],
			"bundleUrl": "i18n/i18n.properties"
		}).then(function(oResourceBundle1) {
			return oResourceBundle1._recreate().then(function(oResourceBundle2) {
				assert.ok(oResourceBundle2 instanceof ResourceBundle, "recreate should resolve with ResourceBundle");
				assert.notEqual(oResourceBundle1, oResourceBundle2, "recreate should not resolve with same instance");
				assert.deepEqual(oResourceBundle1, oResourceBundle2, "recreate should resolve with equal ResourceBundle as new instance");
			});
		});
	});

	QUnit.test("_recreate (sync instance)", function(assert) {
		var oResourceBundle1 = ResourceBundle.create({
			"bundleUrl": "i18n/i18n.properties"
		});
		var oResourceBundle2 = oResourceBundle1._recreate();
		assert.ok(oResourceBundle2 instanceof ResourceBundle, "recreate should resolve with ResourceBundle");
		assert.notEqual(oResourceBundle1, oResourceBundle2, "recreate should not resolve with same instance");
		assert.deepEqual(oResourceBundle1, oResourceBundle2, "recreate should resolve with equal ResourceBundle as new instance");
	});

	QUnit.test("_recreate (sync instance, with enhanceWith)", function(assert) {
		var oResourceBundle1 = ResourceBundle.create({
			"includeInfo": true,
			"enhanceWith": [
				{
					"bundleUrl": "enhance/i18n/i18n.properties",
					"supportedLocales": [""],
					"fallbackLocale": "",
					"bundleUrlRelativeTo": "manifest"
				}
			],
			"bundleUrl": "i18n/i18n.properties"
		});
		var oResourceBundle2 = oResourceBundle1._recreate();
		assert.ok(oResourceBundle2 instanceof ResourceBundle, "recreate should resolve with ResourceBundle");
		assert.notEqual(oResourceBundle1, oResourceBundle2, "recreate should not resolve with same instance");
		assert.deepEqual(oResourceBundle1, oResourceBundle2, "recreate should resolve with equal ResourceBundle as new instance");
	});

	QUnit.test("_recreate (async, rejects with error when not created via factory)", function(assert) {
		return new ResourceBundle("i18n/i18n.properties", undefined, undefined, true /* async */).then(function(oResourceBundle) {
			return oResourceBundle._recreate();
		}).then(function() {
			assert.ok(false, "_recreate should not resolve");
		}, function(err) {
			assert.equal(err.message, "ResourceBundle instance can't be recreated as it has not been created by the ResourceBundle.create factory.");
		});
	});

	QUnit.test("_recreate (sync, throws error when not created via factory)", function(assert) {
		var oResourceBundle = new ResourceBundle("i18n/i18n.properties");
		assert.throws(function() {
			oResourceBundle._recreate();
		}, "ResourceBundle instance can't be recreated as it has not been created by the ResourceBundle.create factory.");
	});

	QUnit.test("multiple resource bundles using _enhance", function(assert) {
		return createResourceBundleWithCustomBundles(this).then(function(oResourceBundle) {
			assert.ok(oResourceBundle, "enhancing a resourceBundle works");
		});
	});

	QUnit.test("fallback locale: fallbackLocale undefined", function(assert) {
		// fallback chain: -> de_CH (not supported) -> de (not supported) -> en (supported, default fallbackLocale)
		// supportedLocales: only "en" is supported
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: ["en"], fallbackLocale: undefined}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_en.properties", "en properties file is requested");
		});
	});

	QUnit.test("fallback locale: supportedLocales undefined", function(assert) {
		// fallback chain: -> de_CH (supported)
		// if supportedLocales is undefined, all locales are supported
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: undefined}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
		});
	});

	QUnit.test("fallback locale: supportedLocales empty, fallback set", function(assert) {
		// fallback chain: -> de_CH (supported)
		// if supportedLocales is empty, all locales are supported
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: [], fallbackLocale: "da"}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
		});
	});

	QUnit.test("fallback locale: supportedLocales undefined, fallback set", function(assert) {
		// fallback chain: -> de_CH (supported)
		// if supportedLocales is undefined, all locales are supported
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: undefined, fallbackLocale: "da"}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
		});
	});

	QUnit.test("fallback locale: supportedLocales not defined, fallback set", function(assert) {
		// fallback chain: -> de_CH (supported)
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, fallbackLocale: "da"}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
		});

	});

	QUnit.test("fallback locale: supportedLocales does not contain fallbackLocale", function(assert) {
		this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));
		var mParams = {url: 'my.properties', locale: "de", async: true, supportedLocales: ["de", "fr"], fallbackLocale: "da"};
		assert.throws(function () {
			ResourceBundle.create(mParams);
		}, new Error("The fallback locale 'da' is not contained in the list of supported locales ['de', 'fr'] of the bundle 'my.properties' and will be ignored."));
	});

	QUnit.test("fallback locale: supportedLocales not defined, but configuration has supportedLocales", function(assert) {
		// configuration returns ["da", "en"] which is used as supportedLocales
		this.stub(Localization, "getSupportedLanguages").returns(["da", "en"]);

		// fallback chain: -> de_CH (not supported) -> de (not supported) -> da (fallback)
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, fallbackLocale: "da"}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_da.properties", "only da properties file is requested");
		});
	});

	QUnit.test("fallback locale: matching fallback", function(assert) {
		// fallback chain: -> de_CH (not supported) -> de (not supported) -> da (fallback)
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: ["da", "en"], fallbackLocale: "da"}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_da.properties", "only da properties file is requested");
		});

	});

	QUnit.test("fallback locale: empty fallback", function(assert) {
		// fallback chain: -> de_CH (not supported) -> de (not supported) -> "" (fallback)
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: ["da", "en", ""], fallbackLocale: ""}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my.properties", "only raw properties file is requested");
		});

	});

	QUnit.test("fallback locale: default fallback is 'en'", function(assert) {
		// fallback chain: -> de_CH (not supported) -> de (not supported) -> en (default fallback)
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: ["da", "en"]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_en.properties", "only en properties file is requested");
		});

	});

	QUnit.test("fallback locale: default fallback, 'en' is not supported", function(assert) {
		// fallback chain: -> de_CH (not supported) -> de (not supported) -> en (not supported) -> "" (not supported)
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: ["da"]}).then(function() {
			assert.equal(oStub.callCount, 0, "is not called because no locale from the fallback chain is supported");
		});
	});

	QUnit.test("fallback locale: fallback with region not supported", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		assert.throws(function () {
			ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: ["da"], fallbackLocale: "en_US"});
		}, new Error("The fallback locale 'en_US' is not contained in the list of supported locales ['da'] of the bundle 'my.properties' and will be ignored."));
		assert.equal(oStub.callCount, 0, "is not called because no locale from the fallback chain is supported");
	});

	QUnit.test("fallback locale: default fallback, empty is supported", function(assert) {
		// -> de_CH (not supported) -> de (not supported) -> en (not supported) -> "" (supported)
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: ["da", ""]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");
		});
	});

	QUnit.test("fallback locale with supportedLocales (normalization)", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));
		var aSupportedLocales = ["he", "en"];
		var pResourceBundle = ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: "iw"});

		return pResourceBundle.then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_he.properties", "locale is normalized but 'he' is part of the supportedLocales therefore 'iw' is mapped to 'he'");
		});
	});

	QUnit.test("fallback locale with supportedLocales empty value (normalization)", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));
		var aSupportedLocales = ["he", "en", ""];
		var pResourceBundle = ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: ""});

		return pResourceBundle.then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my.properties", "empty language is supported and configured as fallback");
		});
	});

	QUnit.test("fallback locale with supportedLocales hebrew 'he_IL' is supported via fallback 'he_IL'", function(assert) {
		var sFallbackLocale = "he_IL";
		var aSupportedLocales = ["he_IL"];
		var sExpectedLocale = "he_IL";

		// fallbackLocale: "he_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// but since the supportedLocales contain "he_IL" the resulting locale is "he_IL" because its ISO639 value ("he_IL") is included in the supportedLocales
		// fallback chain: de_CH (not supported) -> de (not supported) -> iw_IL (supported after conversion to BCP47) ==> he_IL

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: sFallbackLocale}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sr -> sr", function(assert) {
		// Note: This test previously ensured a mapping from sr to sh.
		// The mapping has been removed as support for sr (e.g. sr-Cyrl-RS) was added.

		var sExpectedLocale = "sr";
		var sLocale = "sr";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sr -> (supportedLocales: ['sr'])", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));
		var sLocale = "sr";
		var aSupportedLocales = ["sr"];

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales}).then(function() { //sh
			assert.equal(oStub.callCount, 1);
		});
	});

	QUnit.test("locale sh -> sh", function(assert) {
		var sExpectedLocale = "sh";
		var sLocale = "sh";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sh -> sh (supportedLocales: ['sh'])", function(assert) {
		var sExpectedLocale = "sh";
		var sLocale = "sh";
		var aSupportedLocales = ["sh"];

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sh -> sr_Latn (supportedLocales: ['sr_Latn'])", function(assert) {
		var sExpectedLocale = "sr_Latn";
		var sLocale = "sh";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: ["sr_Latn"]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});



	QUnit.test("locale sr-Latn -> sh", function(assert) {
		var sExpectedLocale = "sh";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "sr-Latn", async: true}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sr-Latn -> sr_Latn (supportedLocales: ['sr_Latn'])", function(assert) {
		var sExpectedLocale = "sr_Latn";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "sr-Latn", async: true, supportedLocales: ["sr_Latn"]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sr-Latn -> sh (supportedLocales: ['sh'])", function(assert) {
		var sExpectedLocale = "sh";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "sr-Latn", async: true, supportedLocales: ["sh"]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sr-Cyrl-RS -> sr_RS", function(assert) {
		var sExpectedLocale = "sr_RS";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "sr-Cyrl-RS", async: true}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("locale sr-Cyrl-RS -> sr (supportedLocales: ['sr'])", function(assert) {
		var sExpectedLocale = "sr";

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: "sr-Cyrl-RS", async: true, supportedLocales: ["sr"]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("supportedLocales hebrew 'he_IL' with input 'he_Latn_IL'", function(assert) {
		var sLocale = "he_Latn_IL";
		var aSupportedLocales = ["he_IL"];
		var sExpectedLocale = "he_IL";

		// locale: "he_Latn_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "he_IL" the resulting locale is "he_IL" because the locale's BCP47 value ("he_IL") is included in the supportedLocales
		// fallback chain: iw_IL (supported after conversion) ==> he_IL

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("supportedLocales hebrew 'iw_IL' with input 'he_Latn_IL'", function(assert) {
		var sLocale = "he_Latn_IL";
		var aSupportedLocales = ["iw_IL"];
		var sExpectedLocale = "iw_IL";

		// locale: "he_Latn_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "iw_IL" therefore the resulting locale is "iw_IL"
		// fallback chain: iw_IL (supported) ==> iw_IL

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("supportedLocales hebrew 'he' with input 'he_IL'", function(assert) {
		var sLocale = "he_IL";
		var aSupportedLocales = ["he"];
		var sExpectedLocale = "he";

		// locale: "he_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "he" therefore the resulting locale is "he" because the locale fallback chain's BCP47 value ("he") is included in the supportedLocales
		// fallback chain: iw_IL (not supported) -> "iw" (supported after conversion to BCP47) ==> he

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("supportedLocales hebrew 'iw' with input 'he_IL'", function(assert) {
		var sLocale = "he_IL";
		var aSupportedLocales = ["iw"];
		var sExpectedLocale = "iw";

		// locale: "he_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "iw" therefore the resulting locale is "iw"
		// fallback chain: iw_IL (not supported) -> "iw" (supported) ==> iw

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("supportedLocales hebrew 'iw' with input 'he_Latn_IL'", function(assert) {
		var aSupportedLocales = ["iw"];
		var sLocale = "he_Latn_IL";
		var sExpectedLocale = "iw";

		// locale: "he_Latn_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "iw" therefore the resulting locale is "iw"
		// fallback chain: iw_IL (not supported) -> "iw" (supported) ==> iw

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("supportedLocales hebrew 'he' with input 'he_Latn_IL'", function(assert) {
		var aSupportedLocales = ["he"];
		var sLocale = "he_Latn_IL";
		var sExpectedLocale = "he";

		// locale: "he_Latn_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "he" therefore the resulting locale is "he" because the locale fallback chain's BCP47 value ("he") is included in the supportedLocales
		// fallback chain: iw_IL (not supported) -> "iw" (supported after conversion to BCP47) ==> he

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});


	QUnit.test("fallback locale with new supportedLocales hebrew 'he' with input 'iw_Latn_IL'", function(assert) {
		var aSupportedLocales = ["he"];
		var sLocale = "iw_Latn_IL";
		var sExpectedLocale = "he";

		// locale: "iw_Latn_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "he" therefore the resulting locale is "he" because the locale fallback chain's BCP47 value ("he") is included in the supportedLocales
		// fallback chain: iw_IL (not supported) -> "iw" (supported after conversion to BCP47) ==> he

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("fallback locale with new supportedLocales hebrew 'iw' with input 'iw_Latn_IL'", function(assert) {
		var aSupportedLocales = ["iw"];
		var sLocale = "iw_Latn_IL";
		var sExpectedLocale = "iw";

		// locale: "iw_Latn_IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "iw" therefore the resulting locale is "iw"
		// fallback chain: iw_IL (not supported) -> "iw" (supported) ==> iw

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("fallback locale with sr-Latn", function(assert) {
		var aSupportedLocales = ["sr-Latn"];
		var sLocale = "sh";
		var sExpectedLocale = "sr_Latn";

		// locale: "iw-IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "iw_IL" therefore the resulting locale is "iw_IL"
		// fallback chain: iw_IL (supported) ==> iw_IL

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("fallback locale with new supportedLocales hebrew 'iw-IL' with input 'iw_Latn_IL'", function(assert) {
		var aSupportedLocales = ["iw-IL"];
		var sLocale = "iw_Latn_IL";
		var sExpectedLocale = "iw_IL";

		// locale: "iw-IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "iw_IL" therefore the resulting locale is "iw_IL"
		// fallback chain: iw_IL (supported) ==> iw_IL

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});

	QUnit.test("fallback locale with new supportedLocales hebrew 'he-IL' with input 'iw_Latn_IL'", function(assert) {
		var aSupportedLocales = ["he-IL"];
		var sLocale = "iw_Latn_IL";
		var sExpectedLocale = "he_IL";

		// locale: "he-IL" is normalized to "iw_IL" (BCP47 -> ISO639)
		// the supportedLocales contain "he_IL" therefore the resulting locale is "he_IL" because the locale fallback chain's BCP47 value ("he_IL") is included in the supportedLocales
		// fallback chain: iw_IL (supported after conversion to BCP47) ==> he_IL

		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0]}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
		});
	});


	QUnit.test("fallback locale with invalid supportedLocales", function(assert) {
		var aSupportedLocales = ["en", "Italienisch", "Deutsch"];

		assert.throws(function () {
			ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: aSupportedLocales});
		}, new TypeError("Locale 'Italienisch' is not a valid BCP47 language tag"), "error is thrown because of invalid parameter values");
	});

	QUnit.test("fallback locale with invalid supportedLocales undefined", function(assert) {
		var aSupportedLocales = [undefined];

		assert.throws(function () {
			ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: aSupportedLocales});
		}, new TypeError("Locale 'undefined' is not a valid BCP47 language tag"), "error is thrown because of invalid parameter values");
	});

	QUnit.test("fallback locale with invalid value", function(assert) {
		var aSupportedLocales = ["it"];

		assert.throws(function () {
			ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: "Italienisch"});
		}, new TypeError("Locale 'Italienisch' is not a valid BCP47 language tag"), "error is thrown because of invalid parameter values");
	});


	QUnit.test("fallback locale with modification of supportedLocales (side effects)", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));
		var aSupportedLocales = ["da", "en"];
		var pResourceBundle = ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: "da"});

		// modify locales array by removing all elements
		aSupportedLocales.splice(0, 2);
		assert.equal(aSupportedLocales.length, 0, "supported locales array is empty");
		return pResourceBundle.then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my_da.properties", "although aSupportedLocales is modified ResourceBundle.create is not affected");
		});
	});

	QUnit.test("_getFallbackLocales", function (assert) {
		var aSupportedLocales = ['en', 'es', 'fr', 'zh_CN', 'zh_TW'];
		assert.deepEqual(ResourceBundle._getFallbackLocales('de-CH'), ['de_CH', 'de', 'en', ''], "fallback chain without knowledge about supported locales");
		assert.deepEqual(ResourceBundle._getFallbackLocales('de-CH', aSupportedLocales), ['en'], "fallback chain with knowledge about supported locales");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh-HK', aSupportedLocales), ['zh_TW', 'en'], "fallback for zh-HK");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh_HK', aSupportedLocales), ['zh_TW', 'en'], "fallback for zh_HK");

		assert.deepEqual(ResourceBundle._getFallbackLocales('de', aSupportedLocales), ['en'], "default fallbackLocale supported");
		assert.deepEqual(ResourceBundle._getFallbackLocales('es', aSupportedLocales), ['es', 'en'], "fallback for es");
		assert.deepEqual(ResourceBundle._getFallbackLocales('de', ['fr']), [], "nothing supported");
		assert.deepEqual(ResourceBundle._getFallbackLocales('es', ['fr', 'es']), ['es'], "fallback for es");

		assert.deepEqual(ResourceBundle._getFallbackLocales('zh-CN', ['zh_CN', 'zh'], 'zh'), ['zh_CN', 'zh'], "fallback for zh_CN");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh-CN', ['zh-CN', 'zh'], 'zh'), ['zh_CN', 'zh'], "fallback for zh_CN");

		assert.deepEqual(ResourceBundle._getFallbackLocales('zh', ['zh-CN', 'zh', 'zh-TW'], 'zh_TW'), ['zh', 'zh_TW'], "fallback for zh");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh', ['zh-CN', 'zh', 'zh-TW'], 'zh-TW'), ['zh', 'zh_TW'], "fallback for zh");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh-CN', ['zh_CN', 'zh', 'zh_TW'], 'zh_TW'), ['zh_CN', 'zh', 'zh_TW'], "fallback for zh_CN (no duplicates)");
		assert.deepEqual(ResourceBundle._getFallbackLocales('zh-CN', ['zh_CN', 'zh', 'zh_TW'], 'zh'), ['zh_CN', 'zh'], "fallback for zh_CN");
	});

	QUnit.test("_getFallbackLocales fallbackLocale not contained", function (assert) {
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('zh-CN', ['zh_CN', 'zh'], 'zh_TW');
		}, new Error("The fallback locale 'zh_TW' is not contained in the list of supported locales ['zh_CN', 'zh'] and will be ignored."));

		assert.throws(function () {
			ResourceBundle._getFallbackLocales('zh-CN', ['zh-CN', 'zh'], 'zh_TW');
		}, new Error("The fallback locale 'zh_TW' is not contained in the list of supported locales ['zh_CN', 'zh'] and will be ignored."));
	});

	QUnit.test("_getFallbackLocales (with modern ISO639 language code)", function (assert) {
		var aSupportedLocales = ['he', 'id', 'en'];
		assert.deepEqual(ResourceBundle._getFallbackLocales('iw-IL'), ['iw_IL', 'iw', 'en', ''], "fallback chain without knowledge about supported locales");
		assert.deepEqual(ResourceBundle._getFallbackLocales('iw-IL', aSupportedLocales), ['he', 'en'], "fallback chain with knowledge about supported locales");
		assert.deepEqual(ResourceBundle._getFallbackLocales('id'), ['id', 'en', ''], "fallback chain without knowledge about supported locales");
		assert.deepEqual(ResourceBundle._getFallbackLocales('id', aSupportedLocales), ['id', 'en'], "fallback chain with knowledge about supported locales");

		// hebrew modern: "he"
		// hebrew legacy: "iw"
		assert.deepEqual(ResourceBundle._getFallbackLocales('he_IL', ['iw'], 'iw'), ['iw'], "fallback for he_IL");
		assert.deepEqual(ResourceBundle._getFallbackLocales('he_IL', ['he'], 'he'), ['he'], "fallback for he_IL");
		assert.deepEqual(ResourceBundle._getFallbackLocales('he_IL', ['iw_IL'], 'iw_IL'), ['iw_IL'], "fallback for he_IL");
		assert.deepEqual(ResourceBundle._getFallbackLocales('he_IL', ['he_IL'], 'he_IL'), ['he_IL'], "fallback for he_IL");

		assert.deepEqual(ResourceBundle._getFallbackLocales('iw_IL', ['iw'], 'iw'), ['iw'], "fallback for iw_IL");
		assert.deepEqual(ResourceBundle._getFallbackLocales('iw_IL', ['he'], 'he'), ['he'], "fallback for iw_IL");
		assert.deepEqual(ResourceBundle._getFallbackLocales('iw_IL', ['iw_IL'], 'iw_IL'), ['iw_IL'], "fallback for iw_IL");
		assert.deepEqual(ResourceBundle._getFallbackLocales('iw_IL', ['he_IL'], 'he_IL'), ['he_IL'], "fallback for iw_IL");

		assert.deepEqual(ResourceBundle._getFallbackLocales('iw', ['iw'], 'iw'), ['iw'], "fallback for iw");
		assert.deepEqual(ResourceBundle._getFallbackLocales('he', ['he'], 'iw'), ['he'], "fallback for he");
		assert.deepEqual(ResourceBundle._getFallbackLocales('iw', ['iw_IL'], 'he_IL'), ['iw_IL'], "fallback for iw");
		assert.deepEqual(ResourceBundle._getFallbackLocales('he', ['he_IL'], 'iw_IL'), ['he_IL'], "fallback for he");
	});

	QUnit.test("_getFallbackLocales (with modern ISO639 language code) not contained", function (assert) {
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('he_IL', ['iw'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw'] and will be ignored."));
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('he_IL', ['he'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he'] and will be ignored."));
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('he_IL', ['iw_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw_IL'] and will be ignored."));
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('he_IL', ['he_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he_IL'] and will be ignored."));


		assert.throws(function () {
			ResourceBundle._getFallbackLocales('iw_IL', ['iw'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw'] and will be ignored."));
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('iw_IL', ['he'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he'] and will be ignored."));
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('iw_IL', ['iw_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw_IL'] and will be ignored."));
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('iw_IL', ['he_IL'], 'es');
		}, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he_IL'] and will be ignored."));

		assert.throws(function () {
			ResourceBundle._getFallbackLocales('iw', ['iw'], 'he_IL');
		}, new Error("The fallback locale 'iw_IL' is not contained in the list of supported locales ['iw'] and will be ignored."));
		assert.throws(function () {
			ResourceBundle._getFallbackLocales('he', ['he'], 'iw_IL');
		}, new Error("The fallback locale 'iw_IL' is not contained in the list of supported locales ['he'] and will be ignored."));
	});

	QUnit.test("getText (multiple resource bundles) checking that nextLocale is loaded", function(assert) {
		var done = assert.async();

		createResourceBundleWithCustomBundles(this)
		.then(function(oResourceBundle) {

			var oSpy = this.spy(Properties, "create");

			// no loading of fallback locale is triggered since all keys are within properties.
			assert.equal(oResourceBundle.getText("number"), "46", "Found in last added custom bundle (custom bundle 2)");
			assert.equal(oResourceBundle.getText("mee"), "yo", "Found in bundle");
			assert.equal(oResourceBundle.getText("mec1"), "ya", "Found in custom bundle 1");
			assert.equal(oResourceBundle.getText("mec2"), "ye", "Found in custom bundle 2");
			assert.equal(oSpy.callCount, 0);

			// fallback locale is loaded since key is not within properties.
			assert.equal(oResourceBundle.getText("unknown"), "unknown", "Not present in any bundle");
			assert.equal(oSpy.callCount, 3, "fallback locale was triggered for every bundle");
			done();
		}.bind(this));

	});

	QUnit.test("getText ignore key fallback (last fallback)", function(assert) {
		var done = assert.async();

		createResourceBundleWithCustomBundles(this)
		.then(function(oResourceBundle) {

			// Correct behavior for a found text
			assert.equal(oResourceBundle.getText("number", [], true), "46", "Correct behavior for a found text with key fallback activated.");
			assert.equal(oResourceBundle.getText("number", [], false), "46", "Correct behavior for a found text with key fallback deactivated.");

			// Correct behavior for a not found text
			assert.equal(oResourceBundle.getText("not_there", [], true), undefined, "Correct behavior for a not found text with key fallback activated.");
			assert.equal(oResourceBundle.getText("not_there", [], false), "not_there", "Correct behavior for a not found text with key fallback deactivated.");

			done();
		});
	});

	QUnit.test("getText should print meaningful assertion error when key is not found", function(assert) {
		var oPropertiesCreateStub = this.stub(Properties, "create");
			oPropertiesCreateStub
			.withArgs({
				url: "my_en_US.properties",
				async: true,
				returnNullIfMissing: true,
				headers: undefined
			}).returns(createFakePropertiesPromise({ "foo": "bar" }))
			.withArgs({
				url: "my_en.properties",
				async: false,
				returnNullIfMissing: true,
				headers: undefined
			}).returns(createFakeProperties({ "foo": "bar" }));

		var oConsoleAssertStub = this.stub(console, "assert");

		// Only supported locale is "de". No fallback to my.properties
		return ResourceBundle.create({url: 'my.properties', locale: "en_US", async: true, supportedLocales: ["en_US", "en"]}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1);
			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_en_US.properties", "en_US properties file is requested");

			// fallback locale is loaded since key is not within properties.
			assert.equal(oResourceBundle.getText("unknown"), "unknown", "Not present in any bundle");

			assert.equal(oPropertiesCreateStub.callCount, 2);
			assert.equal(oPropertiesCreateStub.getCall(1).args[0].url, "my_en.properties", "en properties file is requested as fallback");

			assert.equal(oConsoleAssertStub.callCount, 1, "console.assert should be called once");
			assert.deepEqual(oConsoleAssertStub.getCall(0).args, [
				false,
				"could not find any translatable text for key 'unknown' in bundle file(s): 'my_en_US.properties', 'my_en.properties'"
			], "console.assert should be called with expected message");
		});
	});

	QUnit.test("constructor with fallback chain - locale 'de_CH'", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		// fallback chain: -> de_CH -> de -> de_DE -> "" (supported)
		return ResourceBundle.create({url: 'my.properties', locale: "de_CH", async: true, supportedLocales: [""], fallbackLocale: ""}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");
		});
	});

	QUnit.test("constructor with fallback chain - locale 'de'", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		// fallback chain: -> de -> de_DE -> "" (supported)
		return ResourceBundle.create({url: 'my.properties', locale: "de", async: true, supportedLocales: [""], fallbackLocale: ""}).then(function() {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");
		});
	});

	QUnit.test("getText fallbackChain - locale 'de_CH' and empty fallbackLocale ('')", function(assert) {

		var sLocale = "de_CH";
		var sFallbackLocale = "";

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, fallbackLocale: sFallbackLocale}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de_CH.properties",
				"my_de.properties",
				"my.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText fallbackChain - locale 'de_CH'", function(assert) {

		var sLocale = "de_CH";

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de_CH.properties",
				"my_de.properties",
				"my_en.properties",
				"my.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'fr_FR'", function(assert) {

		var sLocale = "de_CH";
		var sFallbackLocale = "fr_FR";

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, fallbackLocale: sFallbackLocale}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de_CH.properties",
				"my_de.properties",
				"my_fr_FR.properties",
				"my_fr.properties",
				"my.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'de_DE'", function(assert) {

		var sLocale = "de_CH";
		var sFallbackLocale = "de_DE";

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, fallbackLocale: sFallbackLocale}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de_CH.properties",
				"my_de.properties",
				"my_de_DE.properties",
				"my.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText fallbackChain - locale 'de' and fallbackLocale 'de_DE'", function(assert) {

		var sLocale = "de";
		var sFallbackLocale = "de_DE";

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, fallbackLocale: sFallbackLocale}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de.properties", "de properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de.properties",
				"my_de_DE.properties",
				"my.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'he_IL'", function(assert) {

		var sLocale = "de_CH";
		var sFallbackLocale = "he_IL";

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, fallbackLocale: sFallbackLocale}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de_CH.properties",
				"my_de.properties",
				"my_iw_IL.properties",
				"my_iw.properties",
				"my.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'he_IL' and supportedLocales 'de_CH', 'he_IL', 'sh'", function(assert) {

		var sLocale = "de_CH";
		var sFallbackLocale = "he_IL";
		var aSupportedLocales = ["de_CH", "he_IL", "iw"];

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: sFallbackLocale}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de_CH.properties",
				"my_he_IL.properties",
				"my_iw.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'he_IL' and supportedLocales 'de_CH', 'sr', 'iw_IL'", function(assert) {

		var sLocale = "de_CH";
		var sFallbackLocale = "he_IL";
		var aSupportedLocales = ["de_CH", "he", "iw_IL"];

		// needs to be executed sync because
		var oPropertiesCreateStub = this.stub(Properties, "create");
		oPropertiesCreateStub.returns(createFakeProperties({name: "base"}));
		oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({name: "base"}));

		return ResourceBundle.create({url: 'my.properties', locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: sFallbackLocale}).then(function(oResourceBundle) {
			assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");

			assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");

			oResourceBundle.getText("not_there");
			var aUrls = oPropertiesCreateStub.getCalls().map(function(oCall) {
				return oCall.args[0].url;
			});

			assert.deepEqual(aUrls, [
				"my_de_CH.properties",
				"my_iw_IL.properties",
				"my_he.properties"
			], "called urls must match");
		});

	});

	QUnit.test("getText - with placeholder", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({sayHello: "Hello {0}"}));

		return ResourceBundle.create({url: 'my.properties', locale: "", async: true, supportedLocales: [""], fallbackLocale: ""}).then(function(oResourceBundle) {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");

			// placeholder values are given as an array
			assert.equal(oResourceBundle.getText("sayHello", ["Peter", "Marcus"]), "Hello Peter");
			assert.equal(oResourceBundle.getText("sayHello", ["Peter"]), "Hello Peter");

			// "falsy" placeholder values
			assert.equal(oResourceBundle.getText("sayHello", []), "Hello undefined");
			assert.equal(oResourceBundle.getText("sayHello", [""]), "Hello ");

			// array of placeholder values is not given (no formatting)
			assert.equal(oResourceBundle.getText("sayHello"), "Hello {0}");
			assert.equal(oResourceBundle.getText("sayHello", undefined), "Hello {0}");
		});
	});

	/**
	 * Note: this test describes an unsupported usage of getText(...) where placeholder values
	 * are given as positonal parameters, not as an array.
	 *
	 * Future versions of UI5 will forbid this usage!
	 */
	QUnit.test("getText - with placeholder values as positional parameters (not supported)", function(assert) {
		var oStub = this.stub(Properties, "create").returns(createFakePropertiesPromise({sayHello: "Hello {0}"}));
		var oErrorLogSpy = this.spy(Log, "error");
		return ResourceBundle.create({url: 'my.properties', locale: "", async: true, supportedLocales: [""], fallbackLocale: ""}).then(function(oResourceBundle) {
			assert.equal(oStub.callCount, 1);
			assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");
			assert.equal(oErrorLogSpy.callCount, 0, "Log.error should be called once");

			// non-falsy, non-array value for 2nd parameter of #getText
			assert.equal(oResourceBundle.getText("sayHello", "Peter"), "Hello Peter");
			assert.equal(oErrorLogSpy.callCount, 1, "Log.error should be called");
			assert.equal(oErrorLogSpy.getCall(0).args[0],
				"sap/base/i18n/ResourceBundle: value for parameter 'aArgs' is not of type array",
				"Log.error should be called with expected message");

			// non-nullish but "falsy" value for 2nd parameter of #getText
			assert.equal(oResourceBundle.getText("sayHello", ""), "Hello {0}");
			assert.equal(oErrorLogSpy.callCount, 2, "Log.error should be called");
			assert.equal(oErrorLogSpy.getCall(1).args[0],
				"sap/base/i18n/ResourceBundle: value for parameter 'aArgs' is not of type array",
				"Log.error should be called with expected message");
		});
	});

	QUnit.module("sap/base/i18n/ResourceBundle: hdbtextbundle", {
		afterEach: function() {
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("create with default locale", async function(assert) {
		var oEmptyProps = createFakeProperties({number: "47"});
		this.stub(Properties, "create").resolves(oEmptyProps);

		// Uses default locale as defined in testsuite.i18n.qunit.js
		const oResourceBundle = await ResourceBundle.create({url: 'my.hdbtextbundle', async: true});

		assert.ok(oResourceBundle instanceof ResourceBundle);

		assert.deepEqual(oResourceBundle.aPropertyFiles[0], oEmptyProps, "properties are correctly loaded");

		assert.equal(Properties.create.callCount, 1, "Properties.create should be called once");
		assert.deepEqual(Properties.create.getCall(0).args, [{
			async: true,
			headers: {
				"Accept-Language": "en-US"
			},
			returnNullIfMissing: true,
			url: "my.hdbtextbundle"
		}], "Properties.create should be called with expected arguments");
	});

	QUnit.test("create with locale en_US_saptrc", async function(assert) {
		this.stub(Properties, "create").resolves(createFakeProperties({number: "47"}));

		const oResourceBundle = await ResourceBundle.create({
			async: true,
			url: "my.hdbtextbundle",
			locale: "en_US_saptrc"
		});

		assert.ok(oResourceBundle instanceof ResourceBundle);

		assert.equal(Properties.create.callCount, 1, "Properties.create should be called once");
		assert.deepEqual(Properties.create.getCall(0).args, [{
			async: true,
			headers: {
				"Accept-Language": "en-US-saptrc"
			},
			returnNullIfMissing: true,
			url: "my.hdbtextbundle?sap-language=1Q"
		}], "Properties.create should be called with expected arguments");
	});

	QUnit.test("create with locale en_US_sappsd", async function(assert) {
		this.stub(Properties, "create").resolves(createFakeProperties({number: "47"}));

		const oResourceBundle = await ResourceBundle.create({
			async: true,
			url: "my.hdbtextbundle",
			locale: "en_US_sappsd"
		});

		assert.ok(oResourceBundle instanceof ResourceBundle);

		assert.equal(Properties.create.callCount, 1, "Properties.create should be called once");
		assert.deepEqual(Properties.create.getCall(0).args, [{
			async: true,
			headers: {
				"Accept-Language": "en-US-sappsd"
			},
			returnNullIfMissing: true,
			url: "my.hdbtextbundle?sap-language=2Q"
		}], "Properties.create should be called with expected arguments");
	});

	QUnit.test("create with locale en_US_saprigi", async function(assert) {
		this.stub(Properties, "create").resolves(createFakeProperties({number: "47"}));

		const oResourceBundle = await ResourceBundle.create({
			async: true,
			url: "my.hdbtextbundle",
			locale: "en_US_saprigi"
		});

		assert.ok(oResourceBundle instanceof ResourceBundle);

		assert.equal(Properties.create.callCount, 1, "Properties.create should be called once");
		assert.deepEqual(Properties.create.getCall(0).args, [{
			async: true,
			headers: {
				"Accept-Language": "en-US-saprigi"
			},
			returnNullIfMissing: true,
			url: "my.hdbtextbundle?sap-language=3Q"
		}], "Properties.create should be called with expected arguments");
	});

	QUnit.test("create with locale sr_Latn", async function(assert) {
		this.stub(Properties, "create").resolves(createFakeProperties({number: "47"}));

		const oResourceBundle = await ResourceBundle.create({
			async: true,
			url: "my.hdbtextbundle",
			locale: "sr_Latn"
		});

		assert.ok(oResourceBundle instanceof ResourceBundle);

		assert.equal(Properties.create.callCount, 1, "Properties.create should be called once");
		assert.deepEqual(Properties.create.getCall(0).args, [{
			async: true,
			headers: {
				"Accept-Language": "sh"
			},
			returnNullIfMissing: true,
			url: "my.hdbtextbundle"
		}], "Properties.create should be called with expected arguments");
	});

	QUnit.test("create with empty locale", async function(assert) {
		this.stub(Properties, "create").resolves(createFakeProperties({number: "47"}));

		const oResourceBundle = await ResourceBundle.create({
			async: true,
			url: "my.hdbtextbundle",
			locale: "",
			supportedLocales: [""]
		});

		assert.ok(oResourceBundle instanceof ResourceBundle);

		assert.equal(Properties.create.callCount, 1, "Properties.create should be called once");
		assert.deepEqual(Properties.create.getCall(0).args, [{
			async: true,
			headers: {
				"Accept-Language": "*"
			},
			returnNullIfMissing: true,
			url: "my.hdbtextbundle"
		}], "Properties.create should be called with expected arguments");
	});

	var oTerminologies = {
		activeTerminologies: [
			"oil",
			"retail"
		],
		fallbackLocale: "de",
		supportedLocales: [
			"en", "da", "de"
		],
		terminologies: {
			oil: {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.oil.i18n.properties",
				supportedLocales: [
					"da", "en", "de"
				]
			},
			retail: {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.retail.i18n.properties",
				supportedLocales: [
					"da", "de"
				]
			}
		},
		enhanceWith: [
			{
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n/i18n.properties",
				bundleUrlRelativeTo: "manifest",
				supportedLocales: [
					"en", "da", "de"
				],
				fallbackLocale: "de",
				terminologies: {
					oil: {
						bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.oil.i18n.properties",
						supportedLocales: [
							"da", "en", "de"
						]
					},
					retail: {
						bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.retail.i18n.properties",
						supportedLocales: [
							"da", "de"
						],
						bundleUrlRelativeTo: "manifest"
					}
				}
			},
			{
				bundleName: "appvar2.i18n.i18n.properties",
				supportedLocales: [
					"en", "da", "de"
				],
				fallbackLocale: "de",
				terminologies: {
					oil: {
						bundleName: "appvar2.i18n.terminologies.oil.i18n",
						supportedLocales: [
							"da", "en", "de"
						]
					},
					retail: {
						bundleName: "appvar2.i18n.terminologies.retail.i18n",
						supportedLocales: [
							"da", "de"
						]
					}
				}
			}
		]
	};

	QUnit.module("sap/base/i18n/ResourceBundle: Terminologies", {
		beforeEach: function () {
			/*
				configuration structure

				default:
					+ base de
					+--- base retail de
					+--- base oil de

				enhanceWith:
					+ appvar1path de
					+--- appvar2 retail de
					+--- appvar2 oil de
					+ appvar2 de
					+--- appvar1path retail de
					+--- appvar1path oil de
			*/
			this.oCallChainStub = this.stub();

			this.oPropertiesCreateStub = this.stub(Properties, "create");

			this.oPropertiesCreateStub.rejects("Failed");

			// base root
			this.oPropertiesCreateStub.withArgs({
				url: "my_de.properties",
				headers: undefined,
				async: true,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "base de"}, this.oCallChainStub));

			// 2 terminologies base
			this.oPropertiesCreateStub.withArgs({
				url:"test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.retail.i18n_de.properties",
				async: true,
				headers: undefined,
				returnNullIfMissing:true
			}).returns(createFakePropertiesPromise({name: "base retail de"}, this.oCallChainStub));
			this.oPropertiesCreateStub.withArgs({
				url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.oil.i18n_de.properties",
				async: true,
				headers: undefined,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "base oil de"}, this.oCallChainStub));

			// appvar1 root
			this.oPropertiesCreateStub.withArgs({
				url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n/i18n_de.properties",
				headers: undefined,
				async: true,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "appvar1path de"}, this.oCallChainStub));


			// 2 terminonologies appvar1
			this.oPropertiesCreateStub.withArgs({
				url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.retail.i18n_de.properties",
				headers: undefined,
				async: true,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "appvar1path retail de"}, this.oCallChainStub));

			this.oPropertiesCreateStub.withArgs({
				url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.oil.i18n_de.properties",
				headers: undefined,
				async: true,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "appvar1path oil de"}, this.oCallChainStub));

			// appvar2 root
			this.oPropertiesCreateStub.withArgs({
				url: "resources/appvar2/i18n/i18n/properties_de.properties",
				headers: undefined,
				async: true,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "appvar2 de"}, this.oCallChainStub));

			// 2 terminonologies appvar2
			this.oPropertiesCreateStub.withArgs({
				url: "resources/appvar2/i18n/terminologies/retail/i18n_de.properties",
				headers: undefined,
				async: true,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "appvar2 retail de"}, this.oCallChainStub));

			this.oPropertiesCreateStub.withArgs({
				url: "resources/appvar2/i18n/terminologies/oil/i18n_de.properties",
				headers: undefined,
				async: true,
				returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({name: "appvar2 oil de"}, this.oCallChainStub));
		},
		afterEach: function () {
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("terminologies with enhance in enhance", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);
		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};

		var oFirstEnhance = merge({}, mParams.enhanceWith[0]);

		// enhance in enhance
		mParams.enhanceWith[0].enhanceWith = [oFirstEnhance];

		ResourceBundle.create(mParams).then(function() {
			assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called, additional enhance in enhance is not evaluated");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
			done();
		});
	});

	QUnit.test("terminologies no enhanceWith", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);
		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};
		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 3, "stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			// call to "invalid" triggers the fallback chain
			assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// default
				"base oil de",
				"base retail de",
				"base de"
			];

			assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
			assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
			done();
		});
	});

	QUnit.test("terminologies called with entry found in first bundle", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);
		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};
		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			assert.equal(oResourceBundle.getText("name"), "appvar2 oil de", "Found in last added custom bundle (custom bundle 2)");

			assert.equal(that.oCallChainStub.callCount, 1, "call chain only called once because first bundle already has the text");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// app var 2
				"appvar2 oil de"
			];

			assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
			done();
		});
	});

	QUnit.test("getText for terminologies call order", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);
		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};
		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			// call to "invalid" triggers the fallback chain
			assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// app var 2
				"appvar2 oil de",
				"appvar2 retail de",
				"appvar2 de",

				// app var 1
				"appvar1path oil de",
				"appvar1path retail de",
				"appvar1path de",

				// default
				"base oil de",
				"base retail de",
				"base de"
			];

			assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
			assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
			done();
		});
	});

	QUnit.test("terminologies call order empty/no activeTerminologies", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);
		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};
		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 3, "stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			// call to "invalid" triggers the fallback chain
			assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// default
				"appvar2 de",
				"appvar1path de",
				"base de"
			];

			assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
			assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
			done();
		});
	});

	QUnit.test("terminologies call order reverse activeTerminologies", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);
		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};
		mParams.activeTerminologies.reverse();
		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			// call to "invalid" triggers the fallback chain
			assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// app var 2
				"appvar2 retail de",
				"appvar2 oil de",
				"appvar2 de",

				// app var 1
				"appvar1path retail de",
				"appvar1path oil de",
				"appvar1path de",

				// default
				"base retail de",
				"base oil de",
				"base de"
			];

			assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
			assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls, retail comes before oil");
			done();
		});
	});

	QUnit.test("terminologies call order not all locales supported", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);

		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};

		// make not all terminologies support locale "de"
		mParams.terminologies.retail.supportedLocales = ["da"];
		mParams.enhanceWith[0].terminologies.oil.supportedLocales = ["da"];
		mParams.enhanceWith[1].terminologies.retail.supportedLocales = ["de"];

		// make enhanced 2 not support locale "de"
		mParams.enhanceWith[1].supportedLocales = ["da"];
		mParams.enhanceWith[1].fallbackLocale = "da";

		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 7, "stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			// call to "invalid" triggers the fallback chain
			assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// app var 2
				"appvar2 oil de",
				"appvar2 retail de",

				// app var 1
				"appvar1path retail de",
				"appvar1path de",

				// default
				"base oil de",
				"base de"
			];

			assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
			assert.deepEqual(aCallOrder, aExpectedCallOrder, "Correct order of calls");
			done();
		});
	});

	QUnit.test("terminologies call order not all terminologies available", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);

		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};

		// make not all terminologies in all layers present
		delete mParams.terminologies.retail;
		delete mParams.enhanceWith[0].terminologies.oil;
		delete mParams.enhanceWith[1].terminologies.retail;


		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 6, "stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			// call to "invalid" triggers the fallback chain
			assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// app var 2
				"appvar2 oil de",
				"appvar2 de",

				// app var 1
				"appvar1path retail de",
				"appvar1path de",

				// default
				"base oil de",
				"base de"
			];

			assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
			assert.deepEqual(aCallOrder, aExpectedCallOrder, "Correct order of calls");
			done();
		});
	});

	QUnit.test("enhanceWith inherit parameters supportedLocales and fallbackLocale", function(assert) {
		var done = assert.async();
		var that = this;

		var oClonedTerminologies = merge({}, oTerminologies);

		var mParams = {
			url: 'my.properties',
			locale: "de_CH",
			async: true,
			activeTerminologies: oClonedTerminologies.activeTerminologies,
			terminologies: oClonedTerminologies.terminologies,
			supportedLocales: oClonedTerminologies.supportedLocales,
			enhanceWith: oClonedTerminologies.enhanceWith,
			fallbackLocale: oClonedTerminologies.fallbackLocale
		};

		// remove parameters supportedLocales and fallbackLocale
		delete mParams.enhanceWith[0].supportedLocales;
		delete mParams.enhanceWith[1].fallbackLocale;


		ResourceBundle.create(mParams).then(function(oResourceBundle) {
			assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
			assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");

			// call to "invalid" triggers the fallback chain
			assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");

			var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
				return aArgs[0].name;
			});

			var aExpectedCallOrder = [
				// app var 2
				"appvar2 oil de",
				"appvar2 retail de",
				"appvar2 de",

				// app var 1
				"appvar1path oil de",
				"appvar1path retail de",
				"appvar1path de",

				// default
				"base oil de",
				"base retail de",
				"base de"
			];

			assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
			assert.deepEqual(aCallOrder, aExpectedCallOrder, "Correct order of calls");
			done();
		});
	});

	QUnit.module("sap/base/i18n/ResourceBundle: Terminologies integration", {
		afterEach: function(){
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("2 enhancements with 2 terminologies", function(assert) {
		var oOriginalGetTextFromProperties = ResourceBundle.prototype._getTextFromProperties;
		var aBundleUrlsInCallOrder = [];

		this.stub(ResourceBundle.prototype, "_getTextFromProperties").callsFake(function () {
			var oResult = oOriginalGetTextFromProperties.apply(this, arguments);
			aBundleUrlsInCallOrder.push(this.oUrlInfo.url);
			return oResult;
		});

		return ResourceBundle.create({
			// specify url of the base .properties file
			url : "test-resources/sap/ui/core/qunit/testdata/messages.properties",
			async : true,
			locale: "de_CH",
			supportedLocales: ["de"],
			fallbackLocale: "de",
			terminologies: {
				oil: {
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages.properties",
					supportedLocales: [
						"de"
					]
				},
				retail: {
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages.properties",
					supportedLocales: [
						"de"
					]
				}
			},
			activeTerminologies: ["retail", "oil"],
			enhanceWith: [
				{
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties",
					terminologies: {
						oil: {
							bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_custom.properties",
							supportedLocales: [
								"de"
							]
						},
						retail: {
							bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_custom.properties",
							supportedLocales: [
								"de"
							]
						}
					}
				},
				{
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_other.properties",
					terminologies: {
						oil: {
							bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_other.properties",
							supportedLocales: [
								"de"
							]
						},
						retail: {
							bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_other.properties",
							supportedLocales: [
								"de"
							]
						}
					}
				}
			]
		}).then(function(oResourceBundle){
			oResourceBundle.getText("invalid");

			// terminologies bundles before base bundle
			// enhancement bundles before parent bundle

			assert.deepEqual(aBundleUrlsInCallOrder, [
				"test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_other.properties",
				"test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_other.properties",
				"test-resources/sap/ui/core/qunit/testdata/messages_other.properties",
				"test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_custom.properties",
				"test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_custom.properties",
				"test-resources/sap/ui/core/qunit/testdata/messages_custom.properties",
				"test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages.properties",
				"test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages.properties",
				"test-resources/sap/ui/core/qunit/testdata/messages.properties"
			], "the value retrieval should be in correct order");
		});
	});

	QUnit.module("sap/base/i18n/ResourceBundle: Properties Cache", {
		beforeEach: function () {
			this.oPropertiesCreateStub = this.stub(Properties, "create");
			this.oPropertiesCreateStub.withArgs({
				url: 'my_de.properties', headers: undefined, async: false, returnNullIfMissing: true
			}).returns(createFakeProperties({ name: "base" }));
			this.oPropertiesCreateStub.withArgs({
				url: 'my_de.properties', headers: undefined, async: true, returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({ name: "base" }));
		},
		afterEach: function (assert) {
			assert.ok(!this.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
			this.oPropertiesCreateStub.restore();
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("first sync, then sync", function (assert) {
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after first request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is empty");
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after second request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is active");
	});

	QUnit.test("first sync, then async", function (assert) {
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after first request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is empty");
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after second request");

		const aPromises = [];
		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));

		return Promise.all(aPromises).then(() => {
			assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after fourth request");
			assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is active");
		});
	});

	QUnit.test("first async, then sync", function (assert) {
		const aPromises = [];
		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after first request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is empty");
		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after second request");

		return Promise.all(aPromises).then(() => {
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
			assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after fourth request");
			assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is active");
		});
	});

	QUnit.test("first async, then async", function (assert) {
		let aPromises = [];
		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after first request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is empty");
		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after second request");

		return Promise.all(aPromises).then(() => {
			aPromises = [];
			aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
			aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
			return Promise.all(aPromises);
		}).then(() => {
			assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after fourth request");
			assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is active");
		});
	});

	QUnit.test("mixed async/sync", function (assert) {
		const aPromises = [];

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after first request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is empty");

		aPromises.push(Promise.resolve(ResourceBundle.create({ url: 'my.properties', locale: "de", async: false })));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after second request");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was only called twice, because sync and async were concurrently requested");

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after third request");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was only called twice, because initial sync request filled the cache");

		aPromises.push(Promise.resolve(ResourceBundle.create({ url: 'my.properties', locale: "de", async: false })));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after fourth request");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was only called twice, because initial sync request filled the cache");

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after fifth request");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was only called twice, because initial sync request filled the cache");

		aPromises.push(Promise.resolve(ResourceBundle.create({ url: 'my.properties', locale: "de", async: false })));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after sixth request");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was only called twice, because initial sync request filled the cache");

		return Promise.all(aPromises).then(() => {
			assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after seventh request");
			assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because sync and async were concurrently requested");
		});
	});

	QUnit.test("multiple locales", function (assert) {
		this.oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
		var aLocales = [
			"ar", "bg", "ca", "cs", "cy", "da", "de", "de_DE", "el", "en", "en_GB", "es"
		];
		aLocales.forEach(function (sLocale) {
			ResourceBundle.create({ url: 'my.properties', locale: sLocale, async: false });
		});
		aLocales.forEach(function (sLocale) {
			ResourceBundle.create({ url: 'my.properties', locale: sLocale, async: false });
		});

		assert.strictEqual(ResourceBundle._getPropertiesCache().size, aLocales.length, "properties cache is filled with correct number of files");
		assert.equal(this.oPropertiesCreateStub.callCount, aLocales.length, "stub was called once per defined locale");
	});

	QUnit.test("multiple locales with .hdbtextbundle", function(assert) {
		this.oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
		var aLocales = [
			"en", "de", "en_US", "en_US_saptrc"
		];
		aLocales.forEach(function (sLocale) {
			ResourceBundle.create({ url: 'my.hdbtextbundle', locale: sLocale, async: false });
		});
		aLocales.forEach(function (sLocale) {
			ResourceBundle.create({ url: 'my.hdbtextbundle', locale: sLocale, async: false });
		});

		assert.strictEqual(ResourceBundle._getPropertiesCache().size, aLocales.length, "properties cache is filled with correct number of files");
		assert.equal(this.oPropertiesCreateStub.callCount, aLocales.length, "stub was called once per defined locale");
	});

	QUnit.module("sap/base/i18n/ResourceBundle: Properties Cache with same resulting url", {
		beforeEach: function () {
			this.oPropertiesCreateStub = this.stub(Properties, "create");
			this.oPropertiesCreateStub.withArgs({
				url: 'my_de.properties', headers: undefined, async: true, returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({ name: "base" }));
			this.oPropertiesCreateStub.withArgs({
				url: './my_de.properties', headers: undefined, async: true, returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({ name: "base" }));
			this.oPropertiesCreateStub.withArgs({
				url: './mydir/../my_de.properties', headers: undefined, async: true, returnNullIfMissing: true
			}).returns(createFakePropertiesPromise({ name: "base" }));
		},
		afterEach: function (assert) {
			assert.ok(!this.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
			this.oPropertiesCreateStub.restore();
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("Relative URL Notation with and without './'", function (assert) {
		const aPromises = [];
		aPromises.push(ResourceBundle.create({ url: './my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after first request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is empty");

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after second request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is filled with same resulting URL");

		aPromises.push(ResourceBundle.create({ url: './mydir/../my.properties', locale: "de", async: true }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after third request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is filled with same resulting URL");

		return Promise.all(aPromises).then(() => {
			assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one entry after all promised are resolved");
			assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was only called once, because cache is filled with same resulting URL");
		});
	});

	QUnit.module("sap/base/i18n/ResourceBundle: Properties Cache with non-existing properties", {
		beforeEach: function () {
			this.oPropertiesCreateStub = this.stub(Properties, "create");
			this.oPropertiesCreateStub.withArgs({
				url: 'my_de.properties', headers: undefined, async: true, returnNullIfMissing: true
			}).returns(Promise.resolve(null));
			this.oPropertiesCreateStub.withArgs({
				url: 'my_de.properties', headers: undefined, async: false, returnNullIfMissing: true
			}).returns(null);
		},
		afterEach: function (assert) {
			assert.ok(!this.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
			this.oPropertiesCreateStub.restore();
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("Failing requests are not cached: first sync, then sync", function (assert) {
		var aSupportedLocales = ["de"];
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because null values are not cached");
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because null values are not cached");
	});

	QUnit.test("Failing requests are not cached: first sync, then async", async function (assert) {
		var aSupportedLocales = ["de"];
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because null values are not cached");
		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because null values are not cached");
	});
	QUnit.test("Failing requests are not cached: first async, then sync", async function (assert) {
		var aSupportedLocales = ["de"];
		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because null values are not cached");
		ResourceBundle.create({ url: 'my.properties', locale: "de", async: false, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because null values are not cached");
	});

	QUnit.test("Failing requests are not cached: first async, then async", async function (assert) {
		const aSupportedLocales = ["de"];
		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because null values are not cached");
		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true, supportedLocales: aSupportedLocales });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because null values are not cached");
	});

	QUnit.test("Failing requests are not cached: mixed async/sync", async function (assert) {
		const aPromises = [];
		const aSupportedLocales = ["de"];

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true, supportedLocales: aSupportedLocales }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with promise of first async request");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because cache is empty");

		aPromises.push(Promise.resolve(ResourceBundle.create({ url: 'my.properties', locale: "de", async: false, supportedLocales: aSupportedLocales })));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with promise of first async request");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because null values are not cached");

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true, supportedLocales: aSupportedLocales }));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with promise of first async request");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because async request before has not responded an error yet");

		aPromises.push(Promise.resolve(ResourceBundle.create({ url: 'my.properties', locale: "de", async: false, supportedLocales: aSupportedLocales })));
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with promise of first async request");
		assert.equal(this.oPropertiesCreateStub.callCount, 3, "stub was called three times, because only errors are retrieved so far");

		const aAllSettledPromises = await Promise.allSettled(aPromises);
		assert.ok(aAllSettledPromises.every((result) => result.status === "fulfilled"), "All async requests are resolved");
		assert.equal(this.oPropertiesCreateStub.callCount, 3, "stub was called three times, because cache is filled");
	});

	QUnit.module("sap/base/i18n/ResourceBundle: Properties Cache with non parseable properties", {
		beforeEach: function () {
			this.oPropertiesCreateStub = this.stub(Properties, "create");
			this.oParsingError = new Error("An error occurred when parsing the properties file");
			this.oPropertiesCreateStub.withArgs({
				url: 'my_de.properties', headers: undefined, async: true, returnNullIfMissing: true
			}).rejects(this.oParsingError);
			this.oPropertiesCreateStub.withArgs({
				url: 'my_de.properties', headers: undefined, async: false, returnNullIfMissing: true
			}).throws(this.oParsingError);
		},
		afterEach: function (assert) {
			assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");
			this.oPropertiesCreateStub.restore();
			ResourceBundle._getPropertiesCache().clear();
		}
	});

	QUnit.test("Property Files with parsing errors are not cached: first sync, then sync", function (assert) {
		assert.throws(() => {
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		}, "An error occurred when parsing the properties file");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because null values are not cached");
		assert.throws(() => {
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		}, "An error occurred when parsing the properties file");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because null values are not cached");
	});

	QUnit.test("Property Files with parsing errors are not cached: first sync, then async", async function (assert) {
		assert.throws(() => {
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		}, this.oParsingError, "An error is thrown");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because non parseable property files are not cached");
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty, because non parseable property files are not cached");

		// To be clarified: Currently, the ResourceBundle.create gets not rejected when a parsing error occurs
		// try {
		// 	await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });
		// 	assert.ok(false, "Promise should be rejected");
		// } catch (e){
		// 	assert.deepEqual(e, this.oParsingError, "Promise is rejected with the error");
		// }

		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });

		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty, because non parseable property files are not cached");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because non parseable property files are not cached");
	});
	QUnit.test("Property Files with parsing errors are not cached: first async, then sync", async function (assert) {
		// To be clarified: Currently, the ResourceBundle.create gets not rejected when a parsing error occurs
		// try {
		// 	await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });
		// 	assert.ok(false, "Promise should be rejected");
		// } catch (e){
		// 	assert.deepEqual(e, this.oParsingError, "Promise is rejected with the error");
		// }

		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty, because non parseable property files are not cached");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because non parseable property files are not cached");

		assert.throws(() => {
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		}, this.oParsingError, "An error is thrown");
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty, because non parseable property files are not cached");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because non parseable property files are not cached");
	});

	QUnit.test("Property Files with parsing errors are not cached: first async, then async", async function (assert) {
		// To be clarified: Currently, the ResourceBundle.create gets not rejected when a parsing error occurs
		// try {
		// 	await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });
		// 	assert.ok(false, "Promise should be rejected");
		// } catch (e){
		// 	assert.deepEqual(e, this.oParsingError, "Promise is rejected with the error");
		// }

		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty, because non parseable property files are not cached");
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because non parseable property files are not cached");

		// To be clarified: Currently, the ResourceBundle.create gets not rejected when a parsing error occurs
		// try {
		// 	await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });
		// 	assert.ok(false, "Promise should be rejected");
		// } catch (e){
		//	assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty, because non parseable property files are not cached");
		// 	assert.deepEqual(e, this.oParsingError, "Promise is rejected with the error");
		// }

		await ResourceBundle.create({ url: 'my.properties', locale: "de", async: true });
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty, because non parseable property files are not cached");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because non parseable property files are not cached");
	});

	QUnit.test("Property Files with parsing errors are not cached: mixed async/sync", async function (assert) {
		const aPromises = [];
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 0, "properties cache is empty");

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true}));
		assert.equal(this.oPropertiesCreateStub.callCount, 1, "stub was called once, because cache is empty");
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one async request");

		assert.throws(() => {
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		}, this.oParsingError, "An error is thrown");
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because non parseable property files are not cached");
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one async request");

		aPromises.push(ResourceBundle.create({ url: 'my.properties', locale: "de", async: true }));
		assert.equal(this.oPropertiesCreateStub.callCount, 2, "stub was called twice, because async request before has not responded an error yet");
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one async request");

		assert.throws(() => {
			ResourceBundle.create({ url: 'my.properties', locale: "de", async: false });
		});
		assert.equal(this.oPropertiesCreateStub.callCount, 3, "stub was called three times, because non parseable property files are retrieved so far");
		assert.strictEqual(ResourceBundle._getPropertiesCache().size, 1, "properties cache is filled with one async request");

		const aAllSettledPromises = await Promise.allSettled(aPromises);
		// To be clarified: Currently, the ResourceBundle.create gets not rejected when a parsing error occurs
		// assert.ok(aAllSettledPromises.every((result) => result.status === "rejected"), "All async requests are rejected");
		assert.ok(aAllSettledPromises.every((result) => result.status === "fulfilled"), "All async requests are resolved");
		assert.equal(this.oPropertiesCreateStub.callCount, 3, "stub was called three times, because non parseable property files are retrieved so far");
	});

});
