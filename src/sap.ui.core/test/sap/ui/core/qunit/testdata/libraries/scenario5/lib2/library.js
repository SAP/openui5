sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario5/lib3/library",
	"testlibs/scenario5/lib5/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario5.lib2",
		dependencies: [
			"testlibs.scenario5.lib3",
			"testlibs.scenario5.lib5"
		],
		noLibraryCSS: true
	});
});