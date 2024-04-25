sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario1/lib4/library",
	"testlibs/scenario1/lib1/library",
	"testlibs/scenario1/lib7/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario1.lib2",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario1.lib4",
			"testlibs.scenario1.lib1",
			"testlibs.scenario1.lib7"
		],
		noLibraryCSS: true
	});
});