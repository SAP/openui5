sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario13.lib1",
		dependencies: [
			"testlibs.scenario13.lib3",
			"testlibs.scenario13.lib4",
			"testlibs.scenario13.lib5"
		],
		noLibraryCSS: true
	});
});