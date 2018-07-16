/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Test that no theme CSS was loaded as the "preloadLibCss" configuration should prevent it
	 */
	QUnit.test("No Library CSS loaded", function(assert) {
		assert.equal(document.getElementById("sap-ui-theme-sap.ui.core"), null, "'sap.ui.core' theme should not be included");
		assert.equal(document.getElementById("sap-ui-theme-sap.ui.testlib"), null, "'sap.ui.testlib' theme should not be included");
	});

	/**
	 * Test that even though "preloadLibCss" prevents including the library.css, the registered modulepaths
	 * take the configured "themeroots" into account.
	 */
	QUnit.test("Theme Modulepath should be registered accordingly", function(assert) {
		var sTheme = sap.ui.getCore().getConfiguration().getTheme();

		assert.equal(sap.ui.require.toUrl("sap/ui/core/themes/" + sTheme), "foo/bar/sap/ui/core/themes/" + sTheme,
			"Modulepath of 'sap/ui/core/themes/" + sTheme + "' should be set to themeroot.");
		assert.equal(sap.ui.require.toUrl("sap/ui/testlib/themes/" + sTheme), "foo/bar/sap/ui/testlib/themes/" + sTheme,
			"Modulepath of 'sap/ui/testlib/themes/" + sTheme + "' should be set to themeroot.");

	});

});