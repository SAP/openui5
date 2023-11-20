sap.ui.predefine('testlibs/terminologies/notLoadedYet/library',['sap/ui/core/Core'], function(Core) {
	"use strict";
	return sap.ui.getCore().initLibrary({
		name: "testlibs.terminologies.notLoadedYet",
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