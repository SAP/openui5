sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario13.lib1",
		dependencies: [
			"testlibs.scenario13.lib3",
			"testlibs.scenario13.lib4",
			"testlibs.scenario13.lib5"
		],
		noLibraryCSS: true
	});
});