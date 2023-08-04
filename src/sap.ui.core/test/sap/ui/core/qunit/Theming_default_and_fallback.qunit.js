
/* global QUnit */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/theming/ThemeHelper"
], function (
	Core,
	ThemeHelper
) {
	"use strict";

	QUnit.module("Theming");

	QUnit.test("setTheme - fallback to default theme", function(assert) {
		var done = assert.async();

		var sCurrentTheme = Core.getConfiguration().getTheme();
		var sCalculatedDefaultTheme = ThemeHelper.getDefaultThemeInfo().DEFAULT_THEME;
		// 0. Check if initially set theme via bootstrap is correctly changed to a valid default
		assert.equal(sCurrentTheme, sCalculatedDefaultTheme, "Initial theme is correctly set when bootstrap provides outdated theme name");

		// 1. fresh start with a consistent valid theme
		//    no fallback should be applied
		Core.applyTheme("sap_fiori_3_hcw");

		function fiori3check(oEvent) {
			assert.strictEqual(Core.getConfiguration().getTheme(), "sap_fiori_3_hcw", "Core.getConfiguration().getTheme() should return theme 'sap_fiori_3_hcw'.");
			assert.strictEqual(oEvent.getParameter("theme"), "sap_fiori_3_hcw");

			Core.detachThemeChanged(fiori3check);

			// 2. set a theme that is no longer supported
			//    fallback to default (Aug. 2023: "sap_horizon") should be applied
			Core.applyTheme("sap_goldreflection");

			function goldReflectionCheck(oEvent) {
				assert.strictEqual(Core.getConfiguration().getTheme(), sCalculatedDefaultTheme, "Core.getConfiguration().getTheme() should return theme '" + sCalculatedDefaultTheme + "'.");
				assert.strictEqual(oEvent.getParameter("theme"), sCalculatedDefaultTheme);

				Core.detachThemeChanged(goldReflectionCheck);

				// 3. setting a valid theme again should work
				Core.applyTheme("sap_belize");

				function belizeCheck() {
					assert.strictEqual(Core.getConfiguration().getTheme(), "sap_belize", "Core.getConfiguration().getTheme() should return theme 'sap_belize'.");
					assert.strictEqual(oEvent.getParameter("theme"), "sap_belize");

					done();

					Core.detachThemeChanged(belizeCheck);
				}
				Core.attachThemeChanged(belizeCheck);

			}
			Core.attachThemeChanged(goldReflectionCheck);
		}
		Core.attachThemeChanged(fiori3check);
	});
});
