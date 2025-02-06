//@ui5-bundle testlibs/scenario13/lib2/library-preload.js
sap.ui.predefine("testlibs/scenario13/lib2/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario13/lib4/library",
	"testlibs/scenario13/lib1/library",
	"testlibs/scenario13/lib7/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario13.lib2",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario13.lib4",
			"testlibs.scenario13.lib1",
			"testlibs.scenario13.lib7"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});