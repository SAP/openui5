sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario1.lib1",
		dependencies: [
			"testlibs.scenario1.lib3",
			"testlibs.scenario1.lib4",
			"testlibs.scenario1.lib5"
		],
		noLibraryCSS: true
	});
});