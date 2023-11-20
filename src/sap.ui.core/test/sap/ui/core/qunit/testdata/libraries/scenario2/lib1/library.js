sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario2.lib1",
		dependencies: [
			"testlibs.scenario2.lib3",
			"testlibs.scenario2.lib4",
			"testlibs.scenario2.lib5"
		],
		noLibraryCSS: true
	});
});