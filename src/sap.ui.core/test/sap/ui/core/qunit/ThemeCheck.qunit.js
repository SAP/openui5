/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/ThemeCheck",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(ThemeCheck, themeApplied) {
	"use strict";

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

	function getSheetHref(oLink) {
		if (oLink.sheet) {
			return oLink.sheet.href;
		} else if (oLink.styleSheet) {
			return oLink.styleSheet.href;
		}
		return undefined;
	}


	var aLibraries = ["sap.ui.core", "sap.ui.testlib"];

	function testApplyTheme(assert, sTheme) {

		var aLibraryCss = aLibraries.map(function(lib) {
			return {
				name: lib,
				domRef: document.getElementById("sap-ui-theme-" + lib)
			};
		});

		// for the test we need to delay the theme changed event to avoid the cleanup
		// of the old stylesheet which will be performed by the ThemeCheck
		var fnFireThemeChangedEvent = ThemeCheck.prototype.fireThemeChangedEvent;
		ThemeCheck.prototype.fireThemeChangedEvent = function(bOnlyOnInitFail) {
			setTimeout(fnFireThemeChangedEvent.bind(this, bOnlyOnInitFail), 0);
		};

		sap.ui.getCore().applyTheme(sTheme);

		aLibraryCss.forEach(function(lib) {
			assert.equal(lib.domRef.parentNode, document.head, "Old stylesheet for library " + lib.name + " still exits in the DOM.");
			assert.equal(lib.domRef.getAttribute("data-sap-ui-foucmarker"), "sap-ui-theme-" + lib.name, "Attribute for ThemeCheck has been added to old stylesheet.");
		});

		ThemeCheck.prototype.fireThemeChangedEvent = fnFireThemeChangedEvent;

	}

	function testThemeLoaded(assert) {
		aLibraries.forEach(function(lib) {
			var oLibraryCss = document.getElementById("sap-ui-theme-" + lib);
			var sSheetHref = getSheetHref(oLibraryCss);
			assert.equal(sSheetHref, oLibraryCss.href, "href of loaded " + lib + " stylesheet should be equal with link href.");
		});
	}

	function testThemeCheckCleanup(assert) {
		aLibraries.forEach(function(lib) {
			var oOldLibraryCss = document.querySelectorAll("link[data-sap-ui-foucmarker='sap-ui-theme-" + lib + "']");
			assert.equal(oOldLibraryCss && oOldLibraryCss.length || 0, 0, "Old stylesheet for library " + lib + " has been removed.");
		});
	}


	QUnit.test("Initial theme theck", function(assert) {
		var done = assert.async();

		themeApplied().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			done();
		});
	});

	QUnit.test("After theme change with legacy custom.css", function(assert) {
		var done = assert.async();

			themeChanged().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeCheckCleanup(assert);

			// Check if the custom.css has been included
			var oCustomCss = document.getElementById("sap-ui-core-customcss");
			if (!oCustomCss) {
				assert.ok(false, "Custom CSS file hasn't been included");
			} else {
				var oCustomCssHref = oCustomCss.getAttribute("href");
				var sExpectedCustomCssPath = "test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/legacy/custom.css";
				assert.equal(oCustomCssHref, sExpectedCustomCssPath, "Custom CSS file gets loaded from the correct location.");
			}

			done();
		});
		testApplyTheme(assert, "legacy");
	});

	QUnit.test("After theme change with custom.css", function(assert) {
		var done = assert.async();

			themeChanged().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeCheckCleanup(assert);

			// Check if the custom.css has been included
			var oCustomCss = document.getElementById("sap-ui-core-customcss");
			if (!oCustomCss) {
				assert.ok(false, "Custom CSS file hasn't been included");
			} else {
				var oCustomCssHref = oCustomCss.getAttribute("href");
				var sExpectedCustomCssPath = "test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/customcss/custom.css";
				assert.equal(oCustomCssHref, sExpectedCustomCssPath, "Custom CSS file gets loaded from the correct location.");
			}

			done();
		});
		testApplyTheme(assert, "customcss");
	});

	QUnit.test("After theme change without custom.css", function(assert) {
		var done = assert.async();

			themeChanged().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeCheckCleanup(assert);

			// Check if the custom.css has been included
			var oCustomCss = document.getElementById("sap-ui-core-customcss");
			assert.strictEqual(oCustomCss, null, "Custom CSS file should not be included.");

			done();
		});
		testApplyTheme(assert, "sap_hcb");
	});

	QUnit.test("RTL switch doesn't use suppress FOUC feature", function(assert) {

		sap.ui.getCore().getConfiguration().setRTL(true);
		aLibraries.forEach(function(lib) {
			var oLibraryCss = document.getElementById("sap-ui-theme-" + lib);
			assert.ok(oLibraryCss, "Link for " + lib + " stylesheet should be available.");
			var oOldLibraryCss = document.querySelectorAll("link[data-sap-ui-foucmarker='sap-ui-theme-" + lib + "']");
			assert.equal(oOldLibraryCss && oOldLibraryCss.length || 0, 0, "Old stylesheet for library " + lib + " has been removed.");
		});
		sap.ui.getCore().getConfiguration().setRTL(false);

	});


	QUnit.module("Library Loading");

	QUnit.test("sap.ui.getCore().loadLibrary()", function(assert) {
		var done = assert.async();

		themeChanged().then(function() {
			assert.ok(true, "ThemeChanged event has been fired");
			done();
		});

		sap.ui.getCore().loadLibrary("sap.ui.customthemefallback.testlib", {async: true});
	});

	QUnit.test("sap.ui.getCore().loadLibraries()", function(assert) {
		var done = assert.async();

		themeChanged().then(function() {
			assert.ok(true, "ThemeChanged event has been fired");
			done();
		});

		sap.ui.getCore().loadLibraries(["sap.ui.failingcssimport.testlib"], {
			async: true
		});
	});

	QUnit.test("require without loadLibrary/loadLibraries", function(assert) {
		var done = assert.async();

		themeChanged().then(function() {
			assert.ok(true, "ThemeChanged event has been fired");
			done();
		});

		// Fake direct require to a library.js module by just calling initLibrary
		sap.ui.getCore().initLibrary({
			name : "sap.ui.fake.testlib",
			version: "1.0.0",
			dependencies : ["sap.ui.core"],
			types: [],
			controls: [],
			elements: []
		});
	});


	QUnit.module("CORS", {
		beforeEach: function(assert) {

			this.descLinkSheet = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, "sheet");

			Object.defineProperty(HTMLLinkElement.prototype, "sheet", {
				get: function() {
					var obj = {
						href: this.href
					};
					Object.defineProperty(obj, "cssRules", {
						get: function() {
							throw new Error();
						},
						set: function() {}
					});
					return obj;
				},
				set: function() {},
				configurable: true
			});
			var Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");
			sinon.spy(Log, "error");
		},
		afterEach: function(assert) {

			Object.defineProperty(HTMLLinkElement.prototype, "sheet", this.descLinkSheet);
			var Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");
			Log.error.restore();
		}
	});

	QUnit.test("Accessing HTMLLinkElement#sheet.cssRules throws exception", function(assert) {
		var done = assert.async();

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");

		themeChanged().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeCheckCleanup(assert);

			sinon.assert.neverCalledWithMatch(Log.error, sinon.match("Error during check styles"));

			done();
		});
		testApplyTheme(assert, "customcss");
	});
});