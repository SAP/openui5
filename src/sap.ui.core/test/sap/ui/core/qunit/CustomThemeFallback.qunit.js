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
			jQuery.sap.registerResourcePath("sap/ui/failingcssimport/testlib", "./testdata/uilib-failing-css-import/");

			this.oIncludeStyleSheetSpy = sinon.spy(jQuery.sap, "includeStyleSheet");
		},
		afterEach: function() {
			jQuery.sap.registerResourcePath("sap/ui/customthemefallback/testlib", null);
			jQuery.sap.registerResourcePath("sap/ui/failingcssimport/testlib", null);

			this.oIncludeStyleSheetSpy.restore();
		}
	});

	QUnit.test("Fallback for sap.ui.customthemefallback.testlib", function(assert) {
		var oIncludeStyleSheetSpy = this.oIncludeStyleSheetSpy;

		// check precondition for test
		assert.equal(
			sap.ui.getCore().getConfiguration().getTheme(),
			"customcss",
			"[precondition] initial theme must be 'customcss'");

		assert.equal(
			Parameters.get("sapUiTestLibTextColor"),
			undefined,
			"Parameter from fallback theme should be available, yet."
		);

		return sap.ui.getCore().loadLibrary("sap.ui.customthemefallback.testlib", {
			async: true
		}).then(function() {
			return sap.ui.getCore().loadLibrary("sap.ui.failingcssimport.testlib", {
				async: true
			});
		})
		// Wait until the theme has been applied to make sure the fallback was done
		.then(themeApplied)
		.then(function() {

			assert.equal(oIncludeStyleSheetSpy.callCount, 3, "'includeStylesheet' should be called 3 times");

			// first check for expected calls to includeStyleSheet triggered by loadLibrary
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/uilib-custom-theme-fallback/themes/customcss/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				"sap.ui.customthemefallback.testlib should be requested"
			);
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/uilib-failing-css-import/themes/customcss/library.css",
					"sap-ui-theme-sap.ui.failingcssimport.testlib"
				),
				"sap.ui.failingcssimport.testlib should be requested"
			);
			// check for calls to includeStyleSheet triggered by ThemeCheck (theme fallback)
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				"Fallback to sap_hcb (as defined in sapThemeMetadata) for sap.ui.customthemefallback.testlib should be requested"
			);

			// Check for library themes and their correct order
			var aLinks = document.querySelectorAll("link[id^=sap-ui-theme-]");
			assert.equal(aLinks.length, 3, "There should be three library themes included");

			assert.equal(aLinks[0].id, "sap-ui-theme-sap.ui.core",
				"sap.ui.core stylesheet should be first");
			assert.equal(aLinks[0].getAttribute("href"), "./testdata/customcss/sap/ui/core/themes/customcss/library.css",
				"sap.ui.core stylesheet href should be correct");

			assert.equal(aLinks[1].id, "sap-ui-theme-sap.ui.customthemefallback.testlib",
				"sap.ui.customthemefallback.testlib stylesheet should be second");
			assert.equal(aLinks[1].getAttribute("href"), "./testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
				"sap.ui.customthemefallback.testlib stylesheet href should be correct");

			assert.equal(aLinks[2].id, "sap-ui-theme-sap.ui.failingcssimport.testlib",
				"sap.ui.failingcssimport.testlib stylesheet should be second");
			assert.equal(aLinks[2].getAttribute("href"), "./testdata/uilib-failing-css-import/themes/customcss/library.css",
				"sap.ui.failingcssimport.testlib stylesheet href should be correct");

			// Check for custom.css order (should be after last library theme)
			var oCustomCssLink = document.getElementById("sap-ui-core-customcss");
			assert.equal(oCustomCssLink.getAttribute("href"), "./testdata/customcss/sap/ui/core/themes/customcss/custom.css",
				"custom.css stylesheet href should be correct");
			assert.equal(oCustomCssLink.previousSibling, aLinks[2], "custom.css should be inserted last");

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

			assert.equal(oIncludeStyleSheetSpy.callCount, 6, "'includeStylesheet' should be called 6 times");

			// first check for expected calls to includeStyleSheet triggered by loadLibrary
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/customcss/sap/ui/core/themes/legacy/library.css",
					"sap-ui-theme-sap.ui.core"
				),
				"sap.ui.core lib should be requested"
			);
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/uilib-custom-theme-fallback/themes/legacy/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				"sap.ui.customthemefallback.testlib lib should be requested"
			);
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/uilib-failing-css-import/themes/legacy/library.css",
					"sap-ui-theme-sap.ui.failingcssimport.testlib"
				),
				"sap.ui.failingcssimport.testlib lib should be requested"
			);

			// check for calls to includeStyleSheet triggered by ThemeCheck (theme fallback)
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/customcss/sap/ui/core/themes/legacy/custom.css",
					"sap-ui-core-customcss"
				),
				"Custom css should be requested"
			);
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
					"sap-ui-theme-sap.ui.customthemefallback.testlib"
				),
				"Fallback to sap_hcb (as defined in sapThemeMetadata) for sap.ui.customthemefallback.testlib should be requested"
			);
			assert.ok(oIncludeStyleSheetSpy.calledWithExactly(
					"./testdata/uilib-failing-css-import/themes/sap_hcb/library.css",
					"sap-ui-theme-sap.ui.failingcssimport.testlib"
				),
				"Fallback to sap_hcb (as defined in sapThemeMetadata) for sap.ui.failingcssimport.testlib should be requested"
			);

			// Check for library themes and their correct order
			var aLinks = document.querySelectorAll("link[id^=sap-ui-theme-]");
			assert.equal(aLinks.length, 3, "There should be three library themes included");

			assert.equal(aLinks[0].id, "sap-ui-theme-sap.ui.core",
				"sap.ui.core stylesheet should be first");
			assert.equal(aLinks[0].getAttribute("href"), "./testdata/customcss/sap/ui/core/themes/legacy/library.css",
				"sap.ui.core stylesheet href should be correct");

			assert.equal(aLinks[1].id, "sap-ui-theme-sap.ui.customthemefallback.testlib",
				"sap.ui.customthemefallback.testlib stylesheet should be second");
			assert.equal(aLinks[1].getAttribute("href"), "./testdata/uilib-custom-theme-fallback/themes/sap_hcb/library.css",
				"sap.ui.customthemefallback.testlib stylesheet href should be correct");

			assert.equal(aLinks[2].id, "sap-ui-theme-sap.ui.failingcssimport.testlib",
				"sap.ui.failingcssimport.testlib stylesheet should be second");
			assert.equal(aLinks[2].getAttribute("href"), "./testdata/uilib-failing-css-import/themes/sap_hcb/library.css",
				"sap.ui.failingcssimport.testlib stylesheet href should be correct");

			// Check for custom.css order (should be after last library theme)
			var oCustomCssLink = document.getElementById("sap-ui-core-customcss");
			assert.equal(oCustomCssLink.getAttribute("href"), "./testdata/customcss/sap/ui/core/themes/legacy/custom.css",
				"custom.css stylesheet href should be correct");
			assert.equal(oCustomCssLink.previousSibling, aLinks[2], "custom.css should be inserted last");

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