//@ui5-bundle testlibs/terminologies/notLoadedYet/library-preload.js
sap.ui.predefine('testlibs/terminologies/notLoadedYet/library',['sap/ui/core/Lib'], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.terminologies.notLoadedYet",
		apiVersion: 2,
		dependencies: [
			"sap.ui.core"
		],
		noLibraryCSS: true
	});
});

sap.ui.require.preload({
	"testlibs/terminologies/notLoadedYet/manifest.json": JSON.stringify({
		"_version": "1.45.0",
		"name": "testlibs.terminologies.notLoadedYet",
		"sap.ui5": {
			"library": {
				"i18n": {
					"bundleUrl": "i18n/i18n.properties",
					"supportedLocales": ["en", "de"],
					"fallbackLocale": "en",
					"terminologies": {
						"retail": {
							"bundleUrl": "i18n/terminologies/retail/i18n.properties",
							"supportedLocales": ["en", "de"],
							"fallbackLocale": "en"
						}
					}
				}
			}
		}
	})
});