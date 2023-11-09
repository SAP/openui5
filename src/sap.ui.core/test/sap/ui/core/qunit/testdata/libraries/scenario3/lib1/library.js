sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario3.lib1",
		dependencies: [
			"testlibs.scenario3.lib2"
		],
		noLibraryCSS: true
	});
});