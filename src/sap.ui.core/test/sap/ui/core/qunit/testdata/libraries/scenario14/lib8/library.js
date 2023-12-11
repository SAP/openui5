sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario14/lib1/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib8",
		dependencies: [
			"testlibs.scenario14.lib1"
		],
		noLibraryCSS: true
	});
});