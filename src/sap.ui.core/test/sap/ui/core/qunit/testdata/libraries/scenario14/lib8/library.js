sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"testlibs/scenario14/lib1/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario14.lib8",
		dependencies: [
			"testlibs.scenario14.lib1"
		],
		noLibraryCSS: true
	});
});