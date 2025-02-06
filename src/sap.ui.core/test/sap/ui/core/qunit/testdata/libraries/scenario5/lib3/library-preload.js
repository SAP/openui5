//@ui5-bundle testlibs/scenario5/lib3/library-preload.js
sap.ui.predefine("testlibs/scenario5/lib3/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario5/lib6/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario5.lib3",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario5.lib6"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});