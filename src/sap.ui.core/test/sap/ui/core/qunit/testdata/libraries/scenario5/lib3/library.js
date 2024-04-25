sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario5/lib6/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario5.lib3",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario5.lib6"
		],
		noLibraryCSS: true
	});
});