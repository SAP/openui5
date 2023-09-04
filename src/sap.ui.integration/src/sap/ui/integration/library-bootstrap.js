/*!
 * ${copyright}
 */
(function (window) {
	"use strict";
	var coreInstance;
	//identify the own script include
	var scriptTag = document.currentScript || document.querySelector("script[src*='/sap-ui-integration.js']");

	//initialize the loader
	function boot() {
		if (window.sap && window.sap.ui && window.sap.ui.getCore) {
			coreInstance = window.sap.ui.getCore();
			return initTags();
		}
		window.sap.ui.require(['sap/ui/core/Core'],
			function (Core) {
				Core.boot();
				coreInstance = Core;
				Core.attachInit(function () {
					initTags();
				});
			});

	}

	function registerLibraryTags(sLibrary) {
		var oLibrary = coreInstance.getLoadedLibraries()[sLibrary],
			mCustomElements = oLibrary.extensions["sap.ui.integration"].customElements,
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
		coreInstance.loadLibrary("sap.ui.integration", {
			async: true
		}).then(function () {
			//register the tags for this library
			registerLibraryTags("sap.ui.integration");
		});
	}

	boot();
})(window);