//@ui5-bundle testlibs/scenario3/lib1/library-preload.js
sap.ui.predefine("testlibs/scenario3/lib1/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario3/lib2/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario3.lib1",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario3.lib2"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});