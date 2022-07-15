sap.ui.predefine('testlibs/terminologies/simple/library',['sap/ui/core/Core'], function(Core) {
	"use strict";
	return sap.ui.getCore().initLibrary({
		name: "testlibs.terminologies.simple",
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
					"supportedLocales": ["en", "de"],
					"fallbackLocale": "en",
					"terminologies": {
						"oil": {
							"bundleUrl": "i18n/terminologies/oil/i18n.properties",
							"supportedLocales": ["en", "de"],
							"fallbackLocale": "en"
						}
					}
				}
			}
		}
	})
});