/*!
 * ${copyright}
 */
(function (window) {
	"use strict";
	var Core;
	var Lib;
	//identify the own script include
	var scriptTag = document.currentScript || document.querySelector("script[src*='/sap-ui-integration.js']");

	//initialize the loader
	function boot() {
		if (window.sap.ui.require("sap/ui/core/Core") && window.sap.ui.require("sap/ui/core/Lib")) {
			Core = window.sap.ui.require("sap/ui/core/Core");
			Lib = window.sap.ui.require("sap/ui/core/Lib");
			initTags();
			return;
		}

		window.sap.ui.require(["sap/ui/core/Core", "sap/ui/core/Lib"],
			function (_Core, _Lib) {
				Core = _Core;
				Lib = _Lib;

				/**
				 * @deprecated As of version 1.120
				 */
				Core.boot();

				Core.ready().then(initTags);
			});
	}

	function registerLibraryTags(oIntegrationLib) {
		var mCustomElements = oIntegrationLib.extensions["sap.ui.integration"].customElements,
			aTags = Object.keys(mCustomElements),
			sTags = scriptTag.getAttribute("tags");

		if (sTags) {
			aTags = sTags.split(",");
		}

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
		Lib.load({ name: "sap.ui.integration" })
			.then(function (oIntegrationLib) {
				//register the tags for this library
				registerLibraryTags(oIntegrationLib);
			});
	}

	boot();
})(window);