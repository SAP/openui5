//@ui5-bundle testlibs/scenario4/lib2/library-preload.js
sap.ui.predefine("testlibs/scenario4/lib2/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario4/lib1/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario4.lib2",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario4.lib1"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});