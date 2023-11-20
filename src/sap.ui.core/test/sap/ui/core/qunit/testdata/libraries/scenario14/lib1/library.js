sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib1",
		dependencies: [
			"testlibs.scenario14.lib2",
			"testlibs.scenario14.lib5"
		],
		noLibraryCSS: true
	});
});