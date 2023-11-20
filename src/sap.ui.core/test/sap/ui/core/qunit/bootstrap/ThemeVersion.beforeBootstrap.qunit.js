/*global sinon */
sap.ui.define([
], function() {
	"use strict";

	function setupFakeServer(mOptions) {
		// Fake "sap-ui-version.json" request to have a static content
		var oVersionInfo = {
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
			return !(sPath === "resources/sap-ui-version.json" && bAsync === mOptions.async);
		});
		window.oServer.respondWith("GET", "resources/sap-ui-version.json", function(xhr) {
			xhr.respond(
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oVersionInfo)
			);
			// only write the VersionInfo object to the window after it was requested
			// We check for the (un)expected loading of the VersionInfo from the unit tests
			window.oVersionInfo = oVersionInfo;
		});
	}

	// nomen est omen
	var sTestName = new URLSearchParams(window.location.search).get("test");

	var oOptions = window.oTestOptions = {
		async: /-async(?:-|$)/.test(sTestName),
		versionedLibCss: /-on(?:-|$)/.test(sTestName),
		customcss: /-customcss(?:-|$)/.test(sTestName)
	};

	setupFakeServer({async: oOptions.async});
	sinon.stub(sap.ui.loader, "config").callsFake(function(cfg) {
		if ( cfg === undefined ) {
			return { async: oOptions.async };
		} else {
			return sap.ui.loader.config.wrappedMethod.apply(sap.ui.loader, arguments);
		}
	});

});
