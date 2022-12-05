sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario13.lib2",
		dependencies: [
			"testlibs.scenario13.lib4",
			"testlibs.scenario13.lib1",
			"testlibs.scenario13.lib7"
		],
		noLibraryCSS: true
	});
});