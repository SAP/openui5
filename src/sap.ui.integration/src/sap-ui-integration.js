/*!
 * ${copyright}
 */

/*
 * Bootstrap to use sap ui integration in a HTML page in local environment
 *
 * CAUTION: This file is only used in local test environments and cause individual loading of required files
 *          In production this file is replaced with an optimized bundling needed for Cards.
 *
 * - Initialize the ui5 loader
 * - Initialize custom element registration
 * - Based on the dependencies (tags that should be used) automatic registration of these tags
 *   tags are additionally maintained in the library.js file
 * Usage:
 *   <script src="https://some/path/sap-ui-integration.js" id="sap-ui-bootstrap" data-sap-ui-theme="sap_horizon">
 *   </script>
 *
 *   <ui-integration-card manifest="./path/to/manifest"></ui-integration-card>
 */

(function (window) {
	"use strict";

	//enforce complex binding syntax if using sap-ui-integration.js for local development
	window["sap-ui-config"] = window["sap-ui-config"] || {};
	var config = window["sap-ui-config"];
	config["bindingSyntax"] = "complex";
	config["async"] = true;
	config["compatVersion"] = "edge";
	config["xx-waitForTheme"] = true;

	//extract base URL from script tag
	var oScriptTag, mMatch, sBaseUrl;
	var Core;
	var Lib;
	//identify the own script include
	oScriptTag = document.getElementById("sap-ui-bootstrap");

	if (oScriptTag) {
		mMatch = /^(?:.*\/)?resources\//.exec(oScriptTag.getAttribute("src"));
		if (mMatch) {
			sBaseUrl = mMatch[0];
		}
	}

	if (sBaseUrl == null) {
		throw new Error("sap-ui-boot.js: could not identify script tag!");
	}

	function loadScripts(urls, callback) {
		var pending = urls.length,
			errors = 0;

		if (pending === 0) {
			callback();
			return;
		}

		function listener(e) {
			pending--;
			if (e.type === 'error') {
				errors++;
			}
			e.target.removeEventListener("load", listener);
			e.target.removeEventListener("error", listener);
			if (pending === 0 && errors === 0 && callback) {
				callback();
			}
		}

		for (var i = 0; i < urls.length; i++) {
			var script = document.createElement("script");
			script.addEventListener("load", listener);
			script.addEventListener("error", listener);
			script.src = sBaseUrl + urls[i];
			document.head.appendChild(script);
		}
	}

	// cascade 1: the loader
	loadScripts([
		"ui5loader.js"
	], function () {
		// cascade 2: the loader configuration script
		sap.ui.loader.config({
			async: true
		});
		loadScripts([
			"ui5loader-autoconfig.js"
		], function () {
			boot();
		});
	});

	//initialize the loader
	function boot() {
		if (window.sap.ui.require("sap/ui/core/Core") && window.sap.ui.require("sap/ui/core/Lib")) {
			Core = window.sap.ui.require("sap/ui/core/Core");
			Lib = window.sap.ui.require("sap/ui/core/Lib");
			initTags();
			return;
		}

		window.sap.ui.require(["/ui5loader-autoconfig", "sap/ui/core/Core", "sap/ui/core/Lib"],
			function (config, _Core, _Lib) {
				Core = _Core;
				Lib = _Lib;
				Core.boot();
				initTags();
			});
	}

	function registerLibraryTags(oIntegrationLib) {
		var mCustomElements = oIntegrationLib.extensions["sap.ui.integration"].customElements,
			aTags = Object.keys(mCustomElements);

		//collect all the implementation classes and require them
		window.sap.ui.require(
			aTags.map(
				function (o, i) {
					return mCustomElements[aTags[i]];
				}
			)
		);
	}

	function initTags() {
		Lib.load({ name: "sap.ui.integration"})
			.then(function (oIntegrationLib) {
				//register the tags for this library
				registerLibraryTags(oIntegrationLib);
			});
	}
})(window);