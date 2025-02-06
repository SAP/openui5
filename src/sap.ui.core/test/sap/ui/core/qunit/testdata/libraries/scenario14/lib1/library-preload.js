//@ui5-bundle testlibs/scenario14/lib1/library-preload.js
sap.ui.predefine("testlibs/scenario14/lib1/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario14/lib2/library",
	"testlibs/scenario14/lib5/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib1",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario14.lib2",
			"testlibs.scenario14.lib5"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});