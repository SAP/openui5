//@ui5-bundle testlibs/scenario7/lib1/library-preload.js
sap.ui.predefine("testlibs/scenario7/lib1/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario7.lib1",
		apiVersion: 2,
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});