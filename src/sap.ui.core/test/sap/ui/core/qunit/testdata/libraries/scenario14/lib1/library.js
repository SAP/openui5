sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario14.lib1",
		dependencies: [
			"testlibs.scenario14.lib2",
			"testlibs.scenario14.lib5"
		],
		noLibraryCSS: true
	});
});