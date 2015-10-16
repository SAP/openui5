function setupFakeServer(mOptions) {
	// Fake "sap-ui-version.json" request to have a static content
	window.oVersionInfo = {
		"name": "qunit",
		"version": "1.0.0",
		"buildTimestamp": "<TIMESTAMP>",
		"scmRevision": "<HASH>",
		"gav": "<GAV>",
		"libraries": [
			{
				"name": "sap.ui.core",
				"version": "1.1.1",
				"buildTimestamp": "<CORE.TIMESTAMP>",
				"scmRevision": "<CORE.HASH>",
				"gav": "<CORE.GAV>"
			}
		]
	};
	window.oServer = sinon.fakeServer.create();
	window.oServer.autoRespond = true;
	window.oServer.xhr.useFilters = true;
	window.oServer.xhr.addFilter(function(sMethod, sPath, bAsync) {
		return !(sPath === "../../../../../../resources/sap-ui-version.json" && bAsync === mOptions.async);
	});
	window.oServer.respondWith("GET", "../../../../../../resources/sap-ui-version.json",
	[
		200,
		{
			"Content-Type": "application/json"
		},
		JSON.stringify(oVersionInfo)
	]);
}

function setupQUnitTests(mOptions) {
	// check for already loaded libraries which should be "sap.ui.core" as the
	// core synchronously loads the libraries (sap-ui-preload="async" is NOT set)
	window.mInitialLoadedLibraries = sap.ui.getCore().getLoadedLibraries();

	sap.ui.require([
		"jquery.sap.global",
		"sap/ui/thirdparty/URI",
		"sap/ui/core/theming/Parameters"
	], function($, URI, Parameters) {
		sap.ui.getCore().attachInit(function() {

			// restore global fakeServer (for initial sap-ui-version.json request)
			// QUnit test itself should use a fakeServer for each test
			window.oServer.restore();

			QUnit.module("default", {
				initFakeServer: function(sResponseCode) {
					this.oServer = this.sandbox.useFakeXMLHttpRequest();
					this.oServer.autoRespond = true;
					return this.oServer;
				}
			});
			QUnit.test("Initial loaded libraries", function(assert) {
				// This test makes sure that loading the sap-ui-version.json doesn't make
				// the core bootstrap asynchronous if it wasn't configured.
				// Indicator to load async is the sap-ui-preload="async" configuration.

				if (mOptions.async) {
					// in async mode library loading should still be ongoing
					assert.strictEqual(mInitialLoadedLibraries["sap.ui.core"], undefined,
						"'sap.ui.core' should not have been loaded, yet.");
				} else {
					// in sync mode the defined libraries should already be loaded
					assert.notStrictEqual(mInitialLoadedLibraries["sap.ui.core"], undefined,
						"'sap.ui.core' should have been loaded.");
				}
			});
			QUnit.test("sap.ui.versioninfo", function(assert) {
				if (mOptions.versionedLibCss) {
					assert.deepEqual(sap.ui.versioninfo, oVersionInfo,
						"'sap.ui.versioninfo' should have been loaded.");
				} else {
					assert.deepEqual(sap.ui.versioninfo, undefined,
						"'sap.ui.versioninfo' should not have been loaded.");
				}
			});
			QUnit.test("library.css", function(assert) {
				var oLink = $.sap.domById("sap-ui-theme-sap.ui.core");
				var sHref = oLink.getAttribute("href");
				var sCoreVersion = sap.ui.getCore().getLoadedLibraries()["sap.ui.core"].version;

				var sExpectedHref = "../../../../../../resources/sap/ui/core/themes/base/library.css";

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
			QUnit.test("library-parameters.json", function(assert) {
				this.initFakeServer();

				// trigger loading library-parameters.json files
				Parameters.get();

				assert.equal(this.oServer.requests.length, 1,
					"Loading the parameters should trigger one request.");

				var oRequest = this.oServer.requests[0];
				var oUri = new URI(oRequest.url);
				var mParameters = oUri.query(true);
				var sCoreVersion = sap.ui.getCore().getLoadedLibraries()["sap.ui.core"].version;

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

				function fnThemeChanged() {
					sap.ui.getCore().detachThemeChanged(fnThemeChanged);

					var oLink = $.sap.domById("sap-ui-theme-sap.ui.core");
					var sHref = oLink.getAttribute("href");
					var sCoreVersion = sap.ui.getCore().getLoadedLibraries()["sap.ui.core"].version;

					var sExpectedHref = "../../../../../../resources/sap/ui/core/themes/sap_bluecrystal/library.css";

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
				sap.ui.getCore().attachThemeChanged(fnThemeChanged);
				sap.ui.getCore().applyTheme("sap_bluecrystal");
			});
		});
	});
}
