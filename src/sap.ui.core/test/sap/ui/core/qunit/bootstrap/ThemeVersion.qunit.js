/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/URI",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(Localization, Lib, URI, Theming, Parameters, waitForThemeApplied) {
	"use strict";

	// use options and version info as determined by ThemeVersion.beforeBootstrap.qunit.js
	var mOptions = window.oTestOptions;
	var oVersionInfo = window.oVersionInfo;

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
			assert.ok(oVersionInfo, "VersionInfo should have been loaded.");
		} else {
			assert.notOk(oVersionInfo, "VersionInfo should not have been loaded.");
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
				sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + oVersionInfo.version,
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
			sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + oVersionInfo.version,
			"'sap.ui.core' library.css URL should contain version parameters."
		);
	});

	/**
	 * @deprecated
	 */
	QUnit.test("library-parameters.json", function(assert) {
		this.initFakeServer();

		// prevent inline data-uri parameter usage and force a json request to test the request params
		var oLink = document.getElementById("sap-ui-theme-sap.ui.core");
		oLink.style = "background-image: none !important;";

		// trigger loading library-parameters.json files
		Parameters.get();

		if (Theming.getTheme() === "customcss") {
			// the following asserts are relevant for the 'withCredentials' probing.
			// Since the requests goes against the UI5 bootstrap origin, the first request is done without credentials.
			// The second request re-tries with credentials.
			assert.equal(this.oServer.requests.length, 2,
				"Loading the parameters should trigger two requests, as library-parameters.json file does not exist.");

			assert.equal(this.oServer.requests[0].withCredentials, false,
				"library-parameters.json should be requested with 'withCredentials: false'");

			assert.equal(this.oServer.requests[1].withCredentials, true,
				"library-parameters.json should be requested with 'withCredentials: true'");

		} else {
			assert.equal(this.oServer.requests.length, 1,
				"Loading the parameters should trigger one request.");
		}
		var oRequest = this.oServer.requests[0];
		var oUri = new URI(oRequest.url);
		var mParameters = oUri.query(true);
		var sCoreVersion = Lib.all()["sap.ui.core"].version;

		if (mOptions.versionedLibCss) {
			assert.equal(mParameters["version"], sCoreVersion,
				"'sap.ui.core' library-parameters.json URI should contain library version parameter.");
			assert.equal(mParameters["sap-ui-dist-version"], oVersionInfo.version,
				"'sap.ui.core' library-parameters.json URI should contain dist version parameter.");
		} else {
			assert.equal(oUri.query(), "", "'sap.ui.core' library-parameters.json should not contain version parameters.");
		}
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
						sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + oVersionInfo.version,
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
				sExpectedHref + "?version=" + sCoreVersion + "&sap-ui-dist-version=" + oVersionInfo.version,
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
