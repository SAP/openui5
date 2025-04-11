/*global QUnit sinon*/
sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/Lib"
], function(ResourceBundle, Library) {
	"use strict";

	QUnit.module("Library", {
		before: function () {
			// cleanup loader paths registered by default testsuite config
			sap.ui.loader.config({
				paths: {
					"test-resources": null,
					"testdata/core": null
				}
			});
		},
		beforeEach: function() {
			this.oRBCreateSpy = sinon.spy(ResourceBundle, "create");
			this.oRBgetUrlSpy = sinon.spy(ResourceBundle, "_getUrl");
		},
		afterEach: function() {
			this.oRBCreateSpy.restore();
			this.oRBgetUrlSpy.restore();
		}
	});

	QUnit.test("static getResourceBundleFor() - Simple", async function(assert) {
		await Library.load("testlibs.terminologies.simple");
		assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create should be called once");

		var oLibRB = Library.getResourceBundleFor("testlibs.terminologies.simple");
		assert.equal(oLibRB.getText("TEST_TEXT"), "Oil", "'Oil' text is returned, because terminology 'oil' is correctly applied");
	});

	QUnit.test("static getResourceBundleFor() - Absolute bundleUrl shouldn't be resolved", async function(assert) {
		await Library.load("testlibs.terminologies.absoluteBundleUrl");
		assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create should be called once");
		assert.equal(this.oRBgetUrlSpy.returnValues[0], "test-resources/sap/ui/core/qunit/testdata/libraries/terminologies/absoluteBundleUrl/i18n/i18n.properties", "Relative base 'bundleUrl' should be resolved");
		assert.equal(this.oRBgetUrlSpy.returnValues[1], "https://somewhere.else/i18n/terminologies/oil/i18n.properties", "Absolute 'bundleUrl' shouldn't be resolved.");

		var oLibRB = Library.getResourceBundleFor("testlibs.terminologies.absoluteBundleUrl");
		assert.equal(oLibRB.getText("TEST_TEXT"), "Base", "'Base' text is returned, because terminology 'oil' could not be loaded");
	});

	QUnit.test("getResourceBundle(\"de\") - language parameter (sync)", async function(assert) {
		// If the test is single executed, the library might not be loaded yet.
		const iLoaded = Library.isLoaded("testlibs.terminologies.simple") ? 0 : 1;

		const oLib = await Library.load("testlibs.terminologies.simple");
		// If library was already loaded by another test, no ResourceBundle will be loaded again
		assert.equal(this.oRBCreateSpy.callCount, iLoaded, "ResourceBundle.create should be called " + iLoaded + " times");

		const oLibRB = oLib.getResourceBundle("de");

		assert.equal(this.oRBCreateSpy.callCount, iLoaded + 1, "ResourceBundle.create be called " + (iLoaded + 1) + " times");
		assert.equal(oLibRB.getText("TEST_TEXT"), "Öl", "'Öl' text is returned, because terminology 'oil' is correctly applied");
		assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Ein öliger Text", "'Ein öliger Text' text is returned, because terminology 'oil' is correctly applied");
	});

	QUnit.test("loadResourceBundle(\"fr\") - language parameter (async)", async function(assert) {
		// If the test is single executed, the library might not be loaded yet.
		const iLoaded = Library.isLoaded("testlibs.terminologies.simple") ? 0 : 1;

		const oLib = await Library.load("testlibs.terminologies.simple");
		// If library was already loaded by another test, no ResourceBundle will be loaded again
		assert.equal(this.oRBCreateSpy.callCount, iLoaded, "ResourceBundle.create should be called " + iLoaded + " times");

		const oLibRB = await oLib.loadResourceBundle("fr");

		assert.equal(this.oRBCreateSpy.callCount, iLoaded + 1, "ResourceBundle.create be called " + (iLoaded + 1) + " times");
		assert.equal(oLibRB.getText("TEST_TEXT"), "P\u00e9trole", "'P\u00e9trole' text is returned, because terminology 'oil' is correctly applied");
		assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Un texte contenant du p\u00e9trole", "'Un texte contenant du p\u00e9trole' text is returned, because terminology 'oil' is correctly applied");
	});

	QUnit.module("Library not loaded yet", {
		beforeEach: function() {
			this.oRBCreateSpy = sinon.spy(ResourceBundle, "create");
		},
		afterEach: function() {
			this.oRBCreateSpy.restore();
		}
	});

	QUnit.test("loadResourceBundle()", async function (assert) {
		function getResourceBundleWithoutLoadingLib(sLibraryName) {
			const oLib = Library._get(sLibraryName, true /* bCreate */);
			return oLib.loadResourceBundle();
		}

		let oLibRB;

		oLibRB = await getResourceBundleWithoutLoadingLib("testlibs.terminologies.notLoadedYet");
		assert.equal(oLibRB.getText("TEST_TEXT"), "Text from the default bundle", "'Text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Custom text from the default bundle", "'Custom text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create should be called the first time. Default ResourceBundle returned.");

		oLibRB = await getResourceBundleWithoutLoadingLib("testlibs.terminologies.notLoadedYet");
		assert.equal(oLibRB.getText("TEST_TEXT"), "Text from the default bundle", "'Text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Custom text from the default bundle", "'Custom text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create shouldn't be called a second time yet. Default ResourceBundle returned from cache.");

		await Library.load("testlibs.terminologies.notLoadedYet");
		oLibRB = await getResourceBundleWithoutLoadingLib("testlibs.terminologies.notLoadedYet");
		assert.equal(oLibRB.getText("TEST_TEXT"), "Retail", "'Retail' text is returned, because the library is available now and terminology 'retail is correctly applied'.");
		assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Being sold at a retail price", "'Being sold at a retail price' text is returned, because the library is available now and terminology 'retail is correctly applied'.");
		assert.equal(this.oRBCreateSpy.callCount, 2, "ResourceBundle.create should be called a second time. ResourceBundle from the library returned.");
	});
});