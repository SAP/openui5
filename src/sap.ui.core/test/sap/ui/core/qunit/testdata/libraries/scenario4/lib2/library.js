sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario4.lib2",
		dependencies: [
			"testlibs.scenario4.lib1"
		],
		noLibraryCSS: true
	});
});