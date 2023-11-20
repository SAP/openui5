sap.ui.require.preload({
	"fixture/async-sync-conflict_legacyAPIs/library-using-require-declare/library.js": function() {
		"use strict";
		jQuery.sap.require("sap.ui.core.library");
		jQuery.sap.require("fixture.async-sync-conflict_legacyAPIs.library-using-AMD.library");
		sap.ui.getCore().initLibrary({
			name: "fixture.async-sync-conflict_legacyAPIs.library-using-require-declare",
			dependencies : ["sap.ui.core","fixture.async-sync-conflict_legacyAPIs.library-using-AMD"]
		});
	},
	"fixture/async-sync-conflict_legacyAPIs/library-using-require-declare/manifest.json": JSON.stringify({
		"sap.ui5": {
			"dependencies": {
				"libs": {
					"sap.ui.core": {

					},
					"fixture.async-sync-conflict_legacyAPIs.library-using-AMD": {

					}
				}
			}
		}
	})
});