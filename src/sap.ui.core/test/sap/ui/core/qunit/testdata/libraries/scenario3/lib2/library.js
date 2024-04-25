sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario3/lib3/library",
	"testlibs/scenario3/lib4/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario3.lib2",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario3.lib3",
			"testlibs.scenario3.lib4"
		],
		noLibraryCSS: true
	});
});