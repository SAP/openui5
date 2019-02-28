/*!
 * ${copyright}
 */
(function (window) {
	"use strict";
	var coreInstance,
		CustomElements;
	//identify the own script include
	var scriptTag = document.currentScript || document.querySelector("script[src*='/sap-ui-integration.js']");

	//initialize the loader
	function boot() {
		if (window.sap && window.sap.ui && window.sap.ui.getCore) {
			coreInstance = window.sap.ui.getCore();
			return initTags();
		}
		window.sap.ui.require(['sap/ui/core/Core', 'sap/ui/integration/util/CustomElements'],
			function (Core, CE) {
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
		//load the lib(s) and register
		coreInstance.loadLibraries(["sap/ui/integration"], {
			async: true
		}).then(function () {
			//register the tags for this library
			registerLibraryTags("sap.ui.integration");
		});

	}
	boot();
})(window);