sap.ui.define([
	"sap/ui/core/Theming",
	"sap/ui/test/utils/waitForThemeApplied"
], function(Theming, themeApplied) {
	"use strict";
	/* global QUnit */

	const sPath = new URL(sap.ui.require.toUrl(""), document.baseURI).toString();

	QUnit.module("Custom Theme Fallback from URL");

	QUnit.test("Fallback extracted from themeRoot URL", async function(assert) {
		/*
		 * See the test configuration in testsuite.theming.qunit.js for the
		 * test 'CustomThemeFallbackFromURL'
		 *
		 * There's a custom theme root defined for the library sap.ui.core in
		 * which the base theme of the custom theme is defined.
		 *
		 * This is used as fallback theme for all of the libraries, both
		 * sap.ui.core and sap.m, although there's no custom theme root defined
		 * for sap.m where the fallback theme can be extracted.
		 *
		 */

		// Wait until the theme has been applied to make sure the fallback was done
		await themeApplied();

		var aLinksInitial = document.querySelectorAll("link[id^=sap-ui-theme-]");
		assert.equal(aLinksInitial.length, 2, "There should be 2 library themes included");

		const oLinkSapUiCore = document.getElementById("sap-ui-theme-sap.ui.core");
		const oLinkSapM = document.getElementById("sap-ui-theme-sap.m");
		assert.ok(oLinkSapUiCore, "there should be element for sap.ui.core");
		assert.ok(oLinkSapM, "there should be element for sap.m");

		assert.equal(
			Theming.getTheme(),
			"fallbackfromurl",
			"The theme name isn't changed and is still 'fallbackfromurl'");

		assert.equal(oLinkSapUiCore.href, sPath + "/sap/ui/core/themes/sap_fiori_3/library.css",
			"sap.ui.core stylesheet href should be correct");
		assert.equal(oLinkSapM.href, sPath + "/sap/m/themes/sap_fiori_3/library.css",
			"sap.m stylesheet href should be correct");
	});

	QUnit.test("2nd tier fallback extracted from themeRoot URL", async function(assert) {
		/*
		 * See the test configuration in testsuite.theming.qunit.js for the
		 * test 'CustomThemeFallbackFromURL'
		 *
		 * There's a custom theme root defined for the library sap.ui.core.
		 * However the fallback theme derived his not supported anymore as of version 1.136,
		 * in this case we must performa 2nd tier fallback to the latest supported standard theme.
		 */

		Theming.setTheme("2nd_tier_fallback_from_url");

		// Wait until the theme has been applied to make sure the fallback was done
		await themeApplied();

		var aLinksInitial = document.querySelectorAll("link[id^=sap-ui-theme-]");
		assert.equal(aLinksInitial.length, 2, "There should be 2 library themes included");

		const oLinkSapUiCore = document.getElementById("sap-ui-theme-sap.ui.core");
		const oLinkSapM = document.getElementById("sap-ui-theme-sap.m");
		assert.ok(oLinkSapUiCore, "there should be element for sap.ui.core");
		assert.ok(oLinkSapM, "there should be element for sap.m");

		assert.equal(
			Theming.getTheme(),
			"2nd_tier_fallback_from_url",
			"The theme name isn't changed and is still '2nd_tier_fallback_from_url'");

		// The unsupported SAP theme uses the "_hcw" suffix to validate that we fall up to "sap_horizon_hcw".
		assert.equal(oLinkSapUiCore.href, sPath + "/sap/ui/core/themes/sap_horizon_hcw/library.css",
			"sap.ui.core stylesheet href should be correct");
		assert.equal(oLinkSapM.href, sPath + "/sap/m/themes/sap_horizon_hcw/library.css",
			"sap.m stylesheet href should be correct");
	});
});