/*global QUnit sinon*/
sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/Core",
	"sap/ui/model/resource/ResourceModel"
], function(ResourceBundle, Core, ResourceModel) {
	"use strict";

	QUnit.module("Core.loadLibrary", {
		before: function() {
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
		},
		afterEach: function() {
			this.oRBCreateSpy.restore();
		}
	});

	QUnit.test("new ResourceModel()", function(assert) {
		Core.loadLibrary("testlibs.terminologies.simple");

		var oResourceModel = new ResourceModel({
			bundleUrl: jQuery.sap.getModulePath("testlibs.terminologies.simple") + "/i18n/i18n.properties"
		});
		var oResourceBundle = oResourceModel.getResourceBundle();
		assert.equal(oResourceBundle.getText("TEST_TEXT"), "Oil", "'Oil' text is returned, because terminology 'oil' is correctly applied");
		assert.equal(oResourceBundle.getText("TEST_TEXT_CUSTOM"), "A custom text oil", "'A custom text oil' text is returned, because terminology 'oil' is correctly applied");
	});

	QUnit.module("Library not loaded yet", {
		beforeEach: function() {
			this.oRBCreateSpy = sinon.spy(ResourceBundle, "create");
		},
		afterEach: function() {
			this.oRBCreateSpy.restore();
		}
	});

	QUnit.test("getLibraryResourceBundle()", function(assert) {
		// First call without library being loaded
		var oResourceBundle = Core.getLibraryResourceBundle("testlibs.terminologies.notLoadedYet");
		assert.equal(oResourceBundle.getText("TEST_TEXT"), "Text from the default bundle", "'Text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(oResourceBundle.getText("TEST_TEXT_CUSTOM"), "Custom text from the default bundle", "'Custom text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create should be called the first time. Default ResourceBundle returned.");

		// Second call without library being loaded
		oResourceBundle = Core.getLibraryResourceBundle("testlibs.terminologies.notLoadedYet");
		assert.equal(oResourceBundle.getText("TEST_TEXT"), "Text from the default bundle", "'Text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(oResourceBundle.getText("TEST_TEXT_CUSTOM"), "Custom text from the default bundle", "'Custom text from the default bundle' text is returned, because the library isn't loaded yet.");
		assert.equal(this.oRBCreateSpy.callCount, 1, "ResourceBundle.create shouldn't be called a second time yet. ResourceBundle returned from cache.");

		// Loading the library synchronously
		Core.loadLibrary("testlibs.terminologies.notLoadedYet");
		// Third call with library being available
		oResourceBundle = Core.getLibraryResourceBundle("testlibs.terminologies.notLoadedYet");
		assert.equal(oResourceBundle.getText("TEST_TEXT"), "Retail", "'Retail' text is returned, because the library is available now and terminology 'retail is correctly applied'.");
		assert.equal(oResourceBundle.getText("TEST_TEXT_CUSTOM"), "Being sold at a retail price", "'Being sold at a retail price' text is returned, because the library is available now and terminology 'retail is correctly applied'.");
		assert.equal(this.oRBCreateSpy.callCount, 2, "ResourceBundle.create should be called a second time. ResourceBundle from the library returned.");
	});
});