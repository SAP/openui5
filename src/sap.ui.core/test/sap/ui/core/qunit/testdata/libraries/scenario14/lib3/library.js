sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib3",
		dependencies: [
			"testlibs.scenario14.lib4"
		],
		noLibraryCSS: true
	});
});