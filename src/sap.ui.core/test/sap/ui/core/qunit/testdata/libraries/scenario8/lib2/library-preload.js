//@ui5-bundle testlibs/scenario8/lib2/library-preload.js
sap.ui.predefine("testlibs/scenario8/lib2/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario8.lib2",
		apiVersion: 2,
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
});