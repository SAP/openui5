sap.ui.predefine('testlibs/terminologies/absoluteBundleUrl/library',['sap/ui/core/Core'], function(Core) {
	"use strict";
	return sap.ui.getCore().initLibrary({
		name: "testlibs.terminologies.absoluteBundleUrl",
		dependencies: [
			"sap.ui.core"
		],
		noLibraryCSS: true
	});
});

sap.ui.require.preload({
	"testlibs/terminologies/absoluteBundleUrl/manifest.json": JSON.stringify({
		"_version": "1.45.0",
		"name": "testlibs.terminologies.absoluteBundleUrl",
		"sap.ui5": {
			"library": {
				"i18n": {
					"bundleUrl": "i18n/i18n.properties",
					"supportedLocales": ["en"],
					"fallbackLocale": "en",
					"terminologies": {
						"oil": {
							"bundleUrl": "https://somewhere.else/i18n/terminologies/oil/i18n.properties",
							"supportedLocales": ["en"],
							"fallbackLocale": "en"
						}
					}
				}
			}
		}
	})
});