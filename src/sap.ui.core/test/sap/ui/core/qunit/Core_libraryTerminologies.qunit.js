/*global QUnit sinon*/
sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/Core",
	"sap/ui/core/Lib"
], function(ResourceBundle, Core, Lib) {
	"use strict";

	QUnit.module("Core.loadLibrary", {
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

	QUnit.test("getLibraryResourceBundle() - Simple", function(assert) {
		return Core.loadLibrary("testlibs.terminologies.simple", {
			async: true
		}).then(function() {
			assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create should be called once");

			var oLibRB = Core.getLibraryResourceBundle("testlibs.terminologies.simple");
			assert.equal(oLibRB.getText("TEST_TEXT"), "Oil", "'Oil' text is returned, because terminology 'oil' is correctly applied");
		}.bind(this));
	});

	QUnit.test("getLibraryResourceBundle() - Absolute bundleUrl shouldn't be resolved", function(assert) {
		return Core.loadLibrary("testlibs.terminologies.absoluteBundleUrl", {
			async: true
		}).then(function(oLibInfo) {
			assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create should be called once");
			assert.equal(this.oRBgetUrlSpy.returnValues[0], "test-resources/sap/ui/core/qunit/testdata/libraries/terminologies/absoluteBundleUrl/i18n/i18n.properties", "Relative base 'bundleUrl' should be resolved");
			assert.equal(this.oRBgetUrlSpy.returnValues[1], "https://somewhere.else/i18n/terminologies/oil/i18n.properties", "Absolute 'bundleUrl' shouldn't be resolved.");

			var oLibRB = Core.getLibraryResourceBundle("testlibs.terminologies.absoluteBundleUrl");
			assert.equal(oLibRB.getText("TEST_TEXT"), "Base", "'Base' text is returned, because terminology 'oil' could not be loaded");
		}.bind(this));
	});

	QUnit.test("getLibraryResourceBundle() - (de) language parameter", function(assert) {
		// If the test is single executed, the library might not be loaded yet.
		var mLoadedLibraries = Lib.all();
		var iLoaded = mLoadedLibraries["testlibs.terminologies.simple"] ? 0 : 1;

		return Core.loadLibrary("testlibs.terminologies.simple", {
			async: true
		}).then(function() {
			// If library was already loaded by another test, no ResourceBundle will be loaded again
			assert.equal(this.oRBCreateSpy.callCount, iLoaded, "ResourceBundle.create should be called " + iLoaded + " times");

			return Core.getLibraryResourceBundle("testlibs.terminologies.simple", "de", true)
				.then(function(oLibRB) {
					assert.equal(this.oRBCreateSpy.callCount, iLoaded + 1, "ResourceBundle.create be called " + (iLoaded + 1) + " times");
					assert.equal(oLibRB.getText("TEST_TEXT"), "Öl", "'Öl' text is returned, because terminology 'oil' is correctly applied");
					assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Ein öliger Text", "'Ein öliger Text' text is returned, because terminology 'oil' is correctly applied");
				}.bind(this));
		}.bind(this));
	});

	QUnit.module("Library not loaded yet", {
		beforeEach: function() {
			this.oRBCreateSpy = sinon.spy(ResourceBundle, "create");
		},
		afterEach: function() {
			this.oRBCreateSpy.restore();
		}
	});

	QUnit.test("getLibraryResourceBundle()", function (assert) {
		var that = this;

		return Core.getLibraryResourceBundle("testlibs.terminologies.notLoadedYet", true).then(function (oLibRB) {
			assert.equal(oLibRB.getText("TEST_TEXT"), "Text from the default bundle", "'Text from the default bundle' text is returned, because the library isn't loaded yet.");
			assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Custom text from the default bundle", "'Custom text from the default bundle' text is returned, because the library isn't loaded yet.");
			assert.equal(that.oRBCreateSpy.callCount, 1, "ResourceBundle.create should be called the first time. Default ResourceBundle returned.");
			return oLibRB;
		})
		.then(function() {
			return Core.getLibraryResourceBundle("testlibs.terminologies.notLoadedYet", true).then(function (oLibRB) {
				assert.equal(oLibRB.getText("TEST_TEXT"), "Text from the default bundle", "'Text from the default bundle' text is returned, because the library isn't loaded yet.");
				assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Custom text from the default bundle", "'Custom text from the default bundle' text is returned, because the library isn't loaded yet.");
				assert.equal(that.oRBCreateSpy.callCount, 1, "ResourceBundle.create shouldn't be called a second time yet. Default ResourceBundle returned from cache.");
				return oLibRB;
			});
		})
		.then(function () {
			return Core.loadLibrary("testlibs.terminologies.notLoadedYet", {
				async: true
			}).then(function () {
				return Core.getLibraryResourceBundle("testlibs.terminologies.notLoadedYet", true)
					.then(function (oLibRB) {
						assert.equal(oLibRB.getText("TEST_TEXT"), "Retail", "'Retail' text is returned, because the library is available now and terminology 'retail is correctly applied'.");
						assert.equal(oLibRB.getText("TEST_TEXT_CUSTOM"), "Being sold at a retail price", "'Being sold at a retail price' text is returned, because the library is available now and terminology 'retail is correctly applied'.");
						assert.equal(that.oRBCreateSpy.callCount, 2, "ResourceBundle.create should be called a second time. ResourceBundle from the library returned.");
					});
			});
		});
	});
});