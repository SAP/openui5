//@ui5-bundle testlibs/scenario14/lib6/library-preload.js
sap.ui.predefine("testlibs/scenario14/lib6/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario14/lib7/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib6",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario14.lib7"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});