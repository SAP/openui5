/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Theming",
	"sap/ui/test/utils/waitForThemeApplied"
], function(
	Localization,
	Theming,
	waitForThemeApplied
) {
	"use strict";

	// use options and version info as determined by ThemeVersion.beforeBootstrap.qunit.js
	const mOptions = window.oTestOptions;
	const oVersionInfo = window.oVersionInfo;

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
		assert.ok(oVersionInfo, "VersionInfo should have been loaded.");
	});

	QUnit.test("library.css", function(assert) {
		const oLink = document.getElementById("sap-ui-theme-sap.ui.core");
		const sHref = oLink.href;

		let sExpectedHref;
		if (mOptions.customcss) {
			sExpectedHref = "test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/";
		} else {
			sExpectedHref = sap.ui.require.toUrl("sap/ui/core/themes/");
		}
		sExpectedHref += Theming.getTheme() + "/library.css";
		sExpectedHref = new URL(sExpectedHref, document.baseURI);

		assert.equal(
			sHref,
			sExpectedHref + "?sap-ui-dist-version=" + oVersionInfo.version,
			// sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + oVersionInfo.version,
			"'sap.ui.core' library.css URL should contain version parameters."
		);
	});

	QUnit.test("custom.css", function(assert) {
		const oLink = document.getElementById("sap-ui-core-customcss");

		if (!mOptions.customcss) {
			assert.ok(!oLink, "There should not be a custom.css resource if not enabled.");
			return;
		}

		const sHref = oLink.href;
		const sExpectedHref = new URL("test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/" + Theming.getTheme() + "/custom.css", document.baseURI);

		assert.equal(
			sHref,
			sExpectedHref + "?sap-ui-dist-version=" + oVersionInfo.version,
			"'sap.ui.core' library.css URL should contain version parameters."
		);
	});

	QUnit.test("Theme Change", function(assert) {
		const done = assert.async();

		function fnApplied(oEvent) {
			if (oEvent.theme === "sap_fiori_3") {
				Theming.detachApplied(fnApplied);

				const oLink = document.getElementById("sap-ui-theme-sap.ui.core");
				const sHref = oLink.href;

				const sExpectedHref = new URL(sap.ui.require.toUrl("sap/ui/core/themes/sap_fiori_3/library.css"), document.baseURI);

				assert.equal(
					sHref,
					sExpectedHref + "?sap-ui-dist-version=" + oVersionInfo.version,
					"'sap.ui.core' library.css URL should contain version parameters."
				);

				done();
			}
		}
		Theming.attachApplied(fnApplied);
		Theming.setTheme("sap_fiori_3");
	});

	QUnit.test("RTL Change", function(assert) {
		const done = assert.async();
		Localization.setRTL(true);

		// RTL change does not trigger a themeApplied event, therefore we can't use the event for the correct point in time
		setTimeout(function() {
			const oLink = document.getElementById("sap-ui-theme-sap.ui.core");
			const sHref = oLink.href;

			const sExpectedHref = new URL(sap.ui.require.toUrl("sap/ui/core/themes/" + Theming.getTheme() + "/library-RTL.css"), document.baseURI);
			assert.equal(
				sHref,
				sExpectedHref + "?sap-ui-dist-version=" + oVersionInfo.version,
				"'sap.ui.core' library-RTL.css URL should contain version parameters."
			);
			Localization.setRTL(false);
			done();
		});
	});

	return waitForThemeApplied();
});
