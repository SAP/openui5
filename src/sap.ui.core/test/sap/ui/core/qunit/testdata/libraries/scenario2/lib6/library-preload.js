//@ui5-bundle testlibs/scenario2/lib6/library-preload.js
sap.ui.predefine("testlibs/scenario2/lib6/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario2.lib6",
		apiVersion: 2,
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});