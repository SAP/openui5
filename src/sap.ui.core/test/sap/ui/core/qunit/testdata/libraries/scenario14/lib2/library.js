sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario14/lib3/library",
	"testlibs/scenario14/lib6/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib2",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario14.lib3",
			"testlibs.scenario14.lib6"
		],
		noLibraryCSS: true
	});
});