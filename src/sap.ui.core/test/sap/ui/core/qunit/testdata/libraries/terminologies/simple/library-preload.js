//@ui5-bundle testlibs/terminologies/simple/library-preload.js
sap.ui.predefine('testlibs/terminologies/simple/library',['sap/ui/core/Lib'], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.terminologies.simple",
		apiVersion: 2,
		dependencies: [
			"sap.ui.core"
		],
		noLibraryCSS: true
	});
});

sap.ui.require.preload({
	"testlibs/terminologies/simple/manifest.json": JSON.stringify({
		"_version": "1.45.0",
		"name": "testlibs.terminologies.simple",
		"sap.ui5": {
			"library": {
				"i18n": {
					"bundleUrl": "i18n/i18n.properties",
					"supportedLocales": ["en", "de", "fr"],
					"fallbackLocale": "en",
					"terminologies": {
						"oil": {
							"bundleUrl": "i18n/terminologies/oil/i18n.properties",
							"supportedLocales": ["en", "de", "fr"],
							"fallbackLocale": "en"
						}
					}
				}
			}
		}
	})
});