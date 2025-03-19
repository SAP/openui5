//@ui5-bundle testlibs/scenario3/lib3/library-preload.js
sap.ui.predefine("testlibs/scenario3/lib3/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario3.lib3",
		apiVersion: 2,
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});