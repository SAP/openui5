//@ui5-bundle testlibs/terminologies/absoluteBundleUrl/library-preload.js
sap.ui.predefine('testlibs/terminologies/absoluteBundleUrl/library',['sap/ui/core/Lib'], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.terminologies.absoluteBundleUrl",
		apiVersion:2,
		dependencies: [
			"sap.ui.core"
		],
		noLibraryCSS: true
	});
});
