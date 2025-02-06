//@ui5-bundle testlibs/scenario1/lib5/library-preload.js
sap.ui.predefine("testlibs/scenario1/lib5/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario1.lib5",
		apiVersion: 2,
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});