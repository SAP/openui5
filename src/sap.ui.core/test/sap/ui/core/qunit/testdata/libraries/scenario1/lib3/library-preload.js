//@ui5-bundle testlibs/scenario1/lib3/library-preload.js
sap.ui.predefine("testlibs/scenario1/lib3/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario1/lib4/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario1.lib3",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario1.lib4"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});