sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario2/lib4/library",
	"testlibs/scenario2/lib1/library",
	"testlibs/scenario2/lib7/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario2.lib2",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario2.lib4",
			"testlibs.scenario2.lib1",
			"testlibs.scenario2.lib7"
		],
		noLibraryCSS: true
	});
});