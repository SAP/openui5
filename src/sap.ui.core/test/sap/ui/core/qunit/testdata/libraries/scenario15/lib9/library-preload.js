//@ui5-bundle testlibs/scenario15/lib9/library-preload.js
sap.ui.predefine("testlibs/scenario15/lib9/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario15/lib10/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario15.lib9",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario15.lib10"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});