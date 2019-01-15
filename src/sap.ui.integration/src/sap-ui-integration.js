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
			return Promise.resolve();
		}
		//no loader present
		return new Promise(function (resolve, reject) {
			var oScript = document.createElement("script");

			function loaderReady() {
				sap.ui.loader.config({
					baseUrl: sJSResourcePath + "/",
					async: true
				});
				oScript.parentNode.removeChild(oScript);
				resolve();
			}

			oScript.addEventListener("load", loaderReady);
			oScript.setAttribute("src", sJSResourcePath + "/ui5loader.js");
			oScript.setAttribute("async", "true");
			oScript.setAttribute("data-sap-ui-theme", "sap_belize");
			oScript.setAttribute("id", "sap-ui-bootstrap");
			oScript.setAttribute("data-sap-ui-xx-bindingSyntax", "complex");
			oScript.setAttribute("data-sap-ui-preload", "async");
			window.document.head.appendChild(oScript);
		});
	}

	//initialize the loader
	function boot() {
		if (sap && sap.ui && sap.ui.getCore) {
			coreInstance = sap.ui.getCore();
			return Promise.resolve();
		}
		return new Promise(function (resolve, reject) {
			sap.ui.require(['/ui5loader-autoconfig', 'sap/ui/core/Core', 'sap/ui/integration/util/CustomElements'],
				function (config, Core, CE) {
					CustomElements = CE;
					Core.boot();
					coreInstance = Core;
					Core.attachInit(function () {
						resolve();
					});
					//pass on the core instance to Customelements interface
					CustomElements.coreInstance = coreInstance;
				});
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
		sap.ui.require(
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

	//pretty self explaining
	initLoader().then(boot).then(initTags);
})(window);