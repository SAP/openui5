//@ui5-bundle testlibs/scenario15/lib8/library-preload.js
sap.ui.predefine("testlibs/scenario15/lib8/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario15/lib6/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario15.lib8",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario15.lib6"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});