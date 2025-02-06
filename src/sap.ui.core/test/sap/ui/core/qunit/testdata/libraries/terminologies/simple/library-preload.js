//@ui5-bundle testlibs/terminologies/simple/library-preload.js
sap.ui.predefine('testlibs/terminologies/simple/library',['sap/ui/core/Lib'], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.terminologies.simple",
		apiVersion: 2,
		dependencies: [
			"sap.ui.core"
		],
		noLibraryCSS: true
	});
});
