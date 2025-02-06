//@ui5-bundle testlibs/terminologies/notLoadedYet/library-preload.js
sap.ui.predefine('testlibs/terminologies/notLoadedYet/library',['sap/ui/core/Lib'], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.terminologies.notLoadedYet",
		apiVersion: 2,
		dependencies: [
			"sap.ui.core"
		],
		noLibraryCSS: true
	});
});
