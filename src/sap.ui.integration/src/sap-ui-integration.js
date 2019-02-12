/*!
 * ${copyright}
 */

/*
 * Bootstrap to use sap ui integration in a HTML page.
 * - Initialize the ui5 loader
 * - Initialize custom element registration
 * - Based on the dependencies (tags that should be used) automatic registration of these tags
 *   tags are additionally maintained in the library.js file
 * Usage:
 *   <script src="https://some/path/sap-ui-integration.js" tags="card,hostConfiguration" prefix="ui">
 *   </script>
 *
 *   <ui-card manifest="./path/to/manifest" />
 */

(function (window) {
	"use strict";
	var coreInstance,
		CustomElements;
	//identify the own script include
	var scriptTag = document.currentScript || document.querySelector("script[src*='/sap-ui-integration.js']");
	//calculate the path to the loader file from the parent elements path
	var sJSResourcePath = scriptTag.src.substring(0, scriptTag.src.indexOf("/sap-ui-integration.js"));

	//initialize the loader
	function initLoader() {
		//there is already a window.sap.ui.require defined, assume the loader is available and resolve immediately
		if (window.sap && window.sap.ui && window.sap.ui.require) {
			//assume the loader is already available
			return boot();
		}
		var oScript = document.createElement("script");

		function loaderReady() {
			if (!window.sap || !window.sap.ui || !window.sap.ui.require) {
				setTimeout(loaderReady, 10);
				return;
			}
			window.sap.ui.loader.config({
				baseUrl: sJSResourcePath + "/",
				paths: {
					'sap': sJSResourcePath + "/sap"
				},
				async: true
			});
			oScript.parentNode.removeChild(oScript);
			boot();
		}

		oScript.addEventListener("load", loaderReady);
		oScript.setAttribute("src", sJSResourcePath + "/sap-ui-boot.js");
		oScript.setAttribute("async", "true");
		oScript.setAttribute("id", "sap-ui-bootstrap");
		window["sap-ui-config"] = {};
		var sTheme = scriptTag.getAttribute("data-sap-ui-theme");
		if (sTheme) {
			window["sap-ui-config"]["theme"] = sTheme;

		}
		oScript.setAttribute("id", "sap-ui-bootstrap");
		window["sap-ui-config"]["xx-bindingSyntax"] = "complex";
		//window["sap-ui-config"]["preload"] = "async";
		window.document.head.appendChild(oScript);
	}

	//initialize the loader
	function boot() {
		if (window.sap && window.sap.ui && window.sap.ui.getCore) {
			coreInstance = window.sap.ui.getCore();
			return initTags();
		}
		window.sap.ui.require(['/ui5loader-autoconfig', 'sap/ui/core/Core', 'sap/ui/integration/util/CustomElements'],
			function (config, Core, CE) {
				CustomElements = CE;
				Core.boot();
				coreInstance = Core;
				Core.attachInit(function () {
					initTags();
				});
				//pass on the core instance to Customelements interface
				CustomElements.coreInstance = coreInstance;
			});

	}

	function registerLibraryTags(sLibrary) {
		var oLibrary = coreInstance.getLoadedLibraries()[sLibrary];
		//collect the prefix and the relevant tags
		var sPrefix = scriptTag.getAttribute("prefix") || oLibrary.defaultTagPrefix,
			aTags = Object.keys(oLibrary.customTags),
			sTags = scriptTag.getAttribute("tags");
		if (sTags) {
			aTags = sTags.split(",");
		}
		//collect all the implementation classes and require them
		window.sap.ui.require(
			aTags.map(
				function (o, i) {
					return oLibrary.customTags[aTags[i]];
				}
			),
			function () {
				//after require, register the tags via CustomElements
				var args = arguments;
				aTags.forEach(
					function (o, i) {
						CustomElements.registerTag(aTags[i], sPrefix, args[i]);
					}
				);
			});
	}

	function initTags() {
		//need to wait for the onload event of the window to ensure that the MutationObserver reacts
		window.addEventListener("load", function () {
			//load the lib(s) and register
			coreInstance.loadLibraries(["sap/ui/integration"], {
				async: true
			}).then(function () {
				//register the tags for this library
				registerLibraryTags("sap.ui.integration");
			});
		});

	}

	initLoader();
})(window);