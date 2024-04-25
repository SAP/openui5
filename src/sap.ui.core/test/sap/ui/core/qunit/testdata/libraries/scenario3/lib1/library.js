sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario3/lib2/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario3.lib1",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario3.lib2"
		],
		noLibraryCSS: true
	});
});