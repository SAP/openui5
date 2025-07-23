/*global QUnit */
sap.ui.define([
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters"
], function(Theming, Parameters) {
	"use strict";

	/**
	 * Test that even though "preloadLibCss" prevents including the library.css, the registered modulepaths
	 * take the configured "themeroots" into account.
	 */
	QUnit.test("Theme Modulepath should be registered accordingly", function(assert) {
		var sTheme = Theming.getTheme();

		assert.equal(sap.ui.require.toUrl("sap/ui/core/themes/" + sTheme), "foo/bar/sap/ui/core/themes/" + sTheme,
			"Modulepath of 'sap/ui/core/themes/" + sTheme + "' should be set to themeroot.");
		assert.equal(sap.ui.require.toUrl("sap/ui/testlib/themes/" + sTheme), "foo/bar/sap/ui/testlib/themes/" + sTheme,
			"Modulepath of 'sap/ui/testlib/themes/" + sTheme + "' should be set to themeroot.");

	});
	/**
	 * Test that even though "preloadLibCss" prevents including the library.css, link tags added from other sources
	 * with the correct id prefix "sap-ui-theme-" are tracked correctly. Themeing.Applied event should wait for such
	 * CSS files in case they were modified by ThemeManager as part of e.g. a themeChanged call.
	 */
	QUnit.test("ThemeChanged event should wait for CSS files loaded after changeTheme", function(assert) {
		var done = assert.async();
		Theming.setTheme("sap_horizon_hcb");
		// Note: any listener attached after setTheme will only be called after the new theme has been applied
		Theming.attachApplied(function () {
			assert.equal(Parameters.get({ name: "sapUiThemeParamForFantasyLib" }), "#fafafa",
				"Preloaded library CSS was correctly recognized and theme changed event was fired.");
				done();
		});
	});

});