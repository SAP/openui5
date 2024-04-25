sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario14/lib7/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib5",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario14.lib7"
		],
		noLibraryCSS: true
	});
});