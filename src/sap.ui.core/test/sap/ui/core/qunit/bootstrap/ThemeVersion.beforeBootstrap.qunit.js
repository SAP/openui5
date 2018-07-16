/*global sinon */
(function() {
	"use strict";

	function setupFakeServer(mOptions) {
		// Fake "sap-ui-version.json" request to have a static content
		var oVersionInfo = window.oVersionInfo = {
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

	// nomen est omen
	var sTestFileName = window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1);

	var oOptions = window.oTestOptions = {
		async: /-async[-.]/.test(sTestFileName),
		versionedLibCss: /-on[-.]/.test(sTestFileName),
		customcss: /-customcss[-.]/.test(sTestFileName)
	};

	setupFakeServer({async: oOptions.async});

	if ( oOptions.customcss ) {
		window["sap-ui-config"] = {
			themeRoots: {
				"customcss": {
					"sap.ui.core": "../testdata/customcss/"
				}
			}
		};
	}

}());
