sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"testlibs/scenario14/lib3/library",
	"testlibs/scenario14/lib6/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario14.lib2",
		dependencies: [
			"testlibs.scenario14.lib3",
			"testlibs.scenario14.lib6"
		],
		noLibraryCSS: true
	});
});