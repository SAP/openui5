sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario4/lib2/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario4.lib1",
		dependencies: [
			"testlibs.scenario4.lib2"
		],
		noLibraryCSS: true
	});
});