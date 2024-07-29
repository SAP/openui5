sap.ui.define([], function() {
	"use strict";
	//@ui5-bundle fixture/bundle-and-depcache/metadata-bundle.js
	sap.ui.loader.config({
		"bundlesUI5": {
			"fixture/bundle-and-depcache/chunkAB.js": [
				"fixture/bundle-and-depcache/A.js",
				"fixture/bundle-and-depcache/B.js"
			],
			"fixture/bundle-and-depcache/chunkCD.js": [
				"fixture/bundle-and-depcache/C.js",
				"fixture/bundle-and-depcache/D.js"
			],
			"fixture/bundle-and-depcache/chunkE.js": [
				"fixture/bundle-and-depcache/E.js"
			]
		},
		"depCacheUI5": {
			"fixture/bundle-and-depcache/A.js": [
				"fixture/bundle-and-depcache/C.js"
			],
			"fixture/bundle-and-depcache/B.js": [
				"fixture/bundle-and-depcache/E.js"
			],
			"fixture/bundle-and-depcache/C.js": [
				"fixture/bundle-and-depcache/F.js"
			],
			"fixture/bundle-and-depcache/D.js": [],
			"fixture/bundle-and-depcache/E.js": [],
			"fixture/bundle-and-depcache/F.js": [
				"fixture/bundle-and-depcache/G.js"
			],
			"fixture/bundle-and-depcache/G.js": []
		}
	});
});
