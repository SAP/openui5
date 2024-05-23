/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/test/utils/waitForThemeApplied"
], function(Localization, Lib, Theming, waitForThemeApplied) {
	"use strict";

	// use options and version info as determined by ThemeVersion.beforeBootstrap.qunit.js
	var mOptions = window.oTestOptions;

	// restore global fakeServer (for initial sap-ui-version.json request)
	// QUnit test itself should use a fakeServer for each test
	window.oServer.restore();
	sap.ui.loader.config.restore();

	QUnit.module("default", {
		initFakeServer: function(sResponseCode) {
			this.oServer = this._oSandbox.useFakeServer();
			this.oServer.autoRespond = true;
			return this.oServer;
		}
	});

	QUnit.test("Implicit loading of the VersionInfo", function(assert) {
		if (mOptions.versionedLibCss) {
			assert.ok(window.oVersionInfo, "VersionInfo should have been loaded.");
		} else {
			assert.notOk(window.oVersionInfo, "VersionInfo should not have been loaded.");
		}
	});

	QUnit.test("library.css", function(assert) {
		var oLink = document.getElementById("sap-ui-theme-sap.ui.core");
		var sHref = oLink.href;
		var sCoreVersion = Lib.all()["sap.ui.core"].version;

		var sExpectedHref;
		if (mOptions.customcss) {
			sExpectedHref = "test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/";
		} else {
			sExpectedHref = sap.ui.require.toUrl("sap/ui/core/themes/");
		}
		sExpectedHref += Theming.getTheme() + "/library.css";
		sExpectedHref = new URL(sExpectedHref, document.baseURI);

		if (mOptions.versionedLibCss) {
			assert.equal(
				sHref,
				sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + window.oVersionInfo.version,
				"'sap.ui.core' library.css URL should contain version parameters."
			);
		} else {
			assert.equal(
				sHref,
				sExpectedHref,
				"'sap.ui.core' library.css URL should not contain version parameters."
			);
		}
	});

	QUnit.test("custom.css", function(assert) {
		var oLink = document.getElementById("sap-ui-core-customcss");

		if (!mOptions.customcss) {
			assert.ok(!oLink, "There should not be a custom.css resource if not enabled.");
			return;
		}

		var sHref = oLink.href;
		var sCoreVersion = Lib.all()["sap.ui.core"].version;

		var sExpectedHref = new URL("test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/" + Theming.getTheme() + "/custom.css", document.baseURI);

		assert.equal(
			sHref,
			sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + window.oVersionInfo.version,
			"'sap.ui.core' library.css URL should contain version parameters."
		);
	});

	QUnit.test("Theme Change", function(assert) {
		var done = assert.async();

		function fnApplied(oEvent) {
			if (oEvent.theme === "sap_bluecrystal") {
				Theming.detachApplied(fnApplied);

				var oLink = document.getElementById("sap-ui-theme-sap.ui.core");
				var sHref = oLink.href;
				var sCoreVersion = Lib.all()["sap.ui.core"].version;

				var sExpectedHref = new URL(sap.ui.require.toUrl("sap/ui/core/themes/sap_bluecrystal/library.css"), document.baseURI);

				if (mOptions.versionedLibCss) {
					assert.equal(
						sHref,
						sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + window.oVersionInfo.version,
						"'sap.ui.core' library.css URL should contain version parameters."
					);
				} else {
					assert.equal(
						sHref,
						sExpectedHref,
						"'sap.ui.core' library.css URL should not contain version parameters."
					);
				}

				done();
			}
		}
		Theming.attachApplied(fnApplied);
		Theming.setTheme("sap_bluecrystal");
	});

	QUnit.test("RTL Change", function(assert) {
		Localization.setRTL(true);

		var oLink = document.getElementById("sap-ui-theme-sap.ui.core");
		var sHref = oLink.href;
		var sCoreVersion = Lib.all()["sap.ui.core"].version;

		var sExpectedHref = new URL(sap.ui.require.toUrl("sap/ui/core/themes/" + Theming.getTheme() + "/library-RTL.css"), document.baseURI);

		if (mOptions.versionedLibCss) {
			assert.equal(
				sHref,
				sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + window.oVersionInfo.version,
				"'sap.ui.core' library-RTL.css URL should contain version parameters."
			);
		} else {
			assert.equal(
				sHref,
				sExpectedHref,
				"'sap.ui.core' library-RTL.css URL should not contain version parameters."
			);
		}

		Localization.setRTL(false);
	});

	return waitForThemeApplied();
});
