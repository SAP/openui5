sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(Lib, Theming, Parameters, themeApplied) {
	"use strict";
	/* global QUnit */

	var sPath = new URL(sap.ui.require.toUrl("testdata/core"), document.baseURI).toString();

	QUnit.module("Custom Theme Fallback", {
		beforeEach: function() {
			sap.ui.loader.config({paths:{"sap/ui/customthemefallback/testlib": sPath + "/testdata/uilib-custom-theme-fallback/"}});
			sap.ui.loader.config({paths:{"sap/ui/failingcssimport/testlib": sPath + "/testdata/uilib-failing-css-import/"}});
		},
		afterEach: function() {
			sap.ui.loader.config({paths:{"sap/ui/customthemefallback/testlib":null}});
			sap.ui.loader.config({paths:{"sap/ui/failingcssimport/testlib":null}});
		}
	});

	QUnit.test("Fallback for sap.ui.customthemefallback.testlib", async function(assert) {

		var aLinksInitial = document.querySelectorAll("link[id^=sap-ui-theme-]");
		assert.equal(aLinksInitial.length, 1, "There should be one library theme included");
		assert.notOk(document.getElementById("sap-ui-theme-sap.ui.customthemefallback.testlib"), "there should be no customthemefallback element");

		// check precondition for test
		assert.equal(
			Theming.getTheme(),
			"customcss",
			"[precondition] initial theme must be 'customcss'");

		assert.equal(
			Parameters.get({name : "sapUiTestLibTextColor"}),
			undefined,
			"Parameter from fallback theme should be available, yet."
		);

		await Lib.load("sap.ui.customthemefallback.testlib");
		await Lib.load("sap.ui.failingcssimport.testlib");

		// Wait until the theme has been applied to make sure the fallback was done
		await themeApplied();

		var aLinks = document.querySelectorAll("link[id^=sap-ui-theme-]");
		assert.equal(aLinks.length, 3, "There should be three library themes included");

		assert.equal(aLinks[0].id, "sap-ui-theme-sap.ui.core",
			"sap.ui.core stylesheet should be first");
		assert.equal(aLinks[0].href, sPath + "/testdata/customcss/sap/ui/core/themes/customcss/library.css",
			"sap.ui.core stylesheet href should be correct");

		assert.equal(aLinks[1].id, "sap-ui-theme-sap.ui.customthemefallback.testlib",
			"sap.ui.customthemefallback.testlib stylesheet should be second");
		assert.equal(aLinks[1].href, sPath + "/testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
			"sap.ui.customthemefallback.testlib stylesheet href should be correct");

		assert.equal(aLinks[2].id, "sap-ui-theme-sap.ui.failingcssimport.testlib",
			"sap.ui.failingcssimport.testlib stylesheet should be second");
		assert.equal(aLinks[2].href, sPath + "/testdata/uilib-failing-css-import/themes/customcss/library.css",
			"sap.ui.failingcssimport.testlib stylesheet href should be correct");

		// Check for custom.css order (should be after last library theme)
		var oCustomCssLink = document.getElementById("sap-ui-core-customcss");
		assert.equal(oCustomCssLink.href, sPath + "/testdata/customcss/sap/ui/core/themes/customcss/custom.css",
			"custom.css stylesheet href should be correct");
		assert.equal(oCustomCssLink.previousSibling, aLinks[2], "custom.css should be inserted last");

		assert.equal(
			Parameters.get({ name : "sapUiTestLibTextColor" }),
			"#000000",
			"Parameter from fallback theme should be available."
		);

	});

	QUnit.test("Theme change after fallback (with second fallback)", function(assert) {
		Theming.setTheme("legacy");

		return themeApplied().then(function() {

			// Check for library themes and their correct order
			var aLinks = document.querySelectorAll("link[id^=sap-ui-theme-]");
			assert.equal(aLinks.length, 3, "There should be three library themes included");

			assert.equal(aLinks[0].id, "sap-ui-theme-sap.ui.core",
				"sap.ui.core stylesheet should be first");
			assert.equal(aLinks[0].href, sPath + "/testdata/customcss/sap/ui/core/themes/legacy/library.css",
				"sap.ui.core stylesheet href should be correct");

			assert.equal(aLinks[1].id, "sap-ui-theme-sap.ui.customthemefallback.testlib",
				"sap.ui.customthemefallback.testlib stylesheet should be second");
			assert.equal(aLinks[1].href, sPath + "/testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
				"sap.ui.customthemefallback.testlib stylesheet href should be correct");

			assert.equal(aLinks[2].id, "sap-ui-theme-sap.ui.failingcssimport.testlib",
				"sap.ui.failingcssimport.testlib stylesheet should be second");
			assert.equal(aLinks[2].href, sPath + "/testdata/uilib-failing-css-import/themes/sap_hcb/library.css",
				"sap.ui.failingcssimport.testlib stylesheet href should be correct");

			// Check for custom.css order (should be after last library theme)
			var oCustomCssLink = document.getElementById("sap-ui-core-customcss");
			assert.equal(oCustomCssLink.href, sPath + "/testdata/customcss/sap/ui/core/themes/legacy/custom.css",
				"custom.css stylesheet href should be correct");
			assert.equal(oCustomCssLink.previousSibling, aLinks[2], "custom.css should be inserted last");

			assert.equal(
				Parameters.get({ name: "sapUiTestLibTextColor" }),
				"#000000",
				"Parameter from fallback theme should be available."
			);

		});

	});

});