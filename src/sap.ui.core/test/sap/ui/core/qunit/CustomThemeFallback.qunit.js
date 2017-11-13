sap.ui.define([
	"sap/ui/core/theming/Parameters"
], function(Parameters) {
	"use strict";
	/* global QUnit, sinon */

	// Wait until the theme is changed
	function themeChanged() {
		return new Promise(function(resolve) {
			function onChanged() {
				sap.ui.getCore().detachThemeChanged(onChanged);
				resolve();
			}
			sap.ui.getCore().attachThemeChanged(onChanged);
		});
	}

	// Wait until the theme is applied
	function themeApplied() {
		if (sap.ui.getCore().isThemeApplied()) {
			return Promise.resolve();
		} else {
			return themeChanged();
		}
	}

	QUnit.module("Custom Theme Fallback", {
		beforeEach: function() {
			jQuery.sap.registerResourcePath("sap/ui/customthemefallback/testlib", "./testdata/uilib-custom-theme-fallback/");

			this.oIncludeStyleSheetSpy = sinon.spy(jQuery.sap, "includeStyleSheet");
		},
		afterEach: function() {
			jQuery.sap.registerResourcePath("sap/ui/customthemefallback/testlib", null);

			this.oIncludeStyleSheetSpy.restore();
		}
	});

	QUnit.test("Fallback for sap.ui.customthemefallback.testlib", function(assert) {
		var oIncludeStyleSheetSpy = this.oIncludeStyleSheetSpy;

		assert.equal(
			Parameters.get("sapUiTestLibTextColor"),
			undefined,
			"Parameter from fallback theme should be available, yet."
		);

		return sap.ui.getCore().loadLibrary("sap.ui.customthemefallback.testlib", {
			async: true
		})
		// Wait until the theme has been applied to make sure the fallback was done
		.then(themeApplied)
		.then(function() {

			assert.equal(oIncludeStyleSheetSpy.callCount, 2);

			assert.ok(
				oIncludeStyleSheetSpy.getCall(0) &&
				oIncludeStyleSheetSpy.getCall(0).calledWithExactly(
					"./testdata/uilib-custom-theme-fallback/themes/customcss/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				"The custom theme should be included for the sap.ui.customthemefallback.testlib"
			);
			assert.ok(
				oIncludeStyleSheetSpy.getCall(1) &&
				oIncludeStyleSheetSpy.getCall(1).calledWithMatch(
					"./testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				"Afterwards the fallback to sap_hcb (as defined in sapThemeMetadata) should be loaded"
			);

			// Check for library themes and their correct order
			var aLinks = document.querySelectorAll("link[id^=sap-ui-theme-]");
			assert.equal(aLinks.length, 2, "There should be two library themes included");
			assert.equal(aLinks[0].id, "sap-ui-theme-sap.ui.core", "sap.ui.core stylesheet should be first");
			assert.equal(aLinks[1].id, "sap-ui-theme-sap.ui.customthemefallback.testlib",
				"sap.ui.customthemefallback.testlib stylesheet should be second");

			assert.equal(
				Parameters.get("sapUiTestLibTextColor"),
				"#000000",
				"Parameter from fallback theme should be available."
			);

		});
	});

	QUnit.test("Theme change after fallback (with second fallback)", function(assert) {
		var oIncludeStyleSheetSpy = this.oIncludeStyleSheetSpy;

		var p = themeChanged().then(function() {

			assert.equal(oIncludeStyleSheetSpy.callCount, 4);

			assert.ok(
				oIncludeStyleSheetSpy.getCall(0) &&
				oIncludeStyleSheetSpy.getCall(0).calledWithExactly(
					"./testdata/customcss/sap/ui/core/themes/legacy/library.css",
					"sap-ui-theme-sap.ui.core"
				),
				"sap.ui.core lib should be handled first"
			);
			assert.ok(
				oIncludeStyleSheetSpy.getCall(1) &&
				oIncludeStyleSheetSpy.getCall(1).calledWithExactly(
					"./testdata/uilib-custom-theme-fallback/themes/legacy/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				"sap.ui.customthemefallback.testlib lib should be handled second"
			);
			assert.ok(
				oIncludeStyleSheetSpy.getCall(2) &&
				oIncludeStyleSheetSpy.getCall(2).calledWithExactly(
					"./testdata/customcss/sap/ui/core/themes/legacy/custom.css",
					"sap-ui-core-customcss"
				),
				"Custom css should be included"
			);
			assert.ok(
				oIncludeStyleSheetSpy.getCall(3) &&
				oIncludeStyleSheetSpy.getCall(3).calledWithExactly(
					"./testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				""
			);

			// Check for library themes and their correct order
			var aLinks = document.querySelectorAll("link[id^=sap-ui-theme-]");
			assert.equal(aLinks.length, 2, "There should be two library themes included");
			assert.equal(aLinks[0].id, "sap-ui-theme-sap.ui.core", "sap.ui.core stylesheet should be first");
			assert.equal(aLinks[1].id, "sap-ui-theme-sap.ui.customthemefallback.testlib",
				"sap.ui.customthemefallback.testlib stylesheet should be second");

			assert.equal(
				Parameters.get("sapUiTestLibTextColor"),
				"#000000",
				"Parameter from fallback theme should be available."
			);

		});

		sap.ui.getCore().applyTheme("legacy");

		return p;
	});

});