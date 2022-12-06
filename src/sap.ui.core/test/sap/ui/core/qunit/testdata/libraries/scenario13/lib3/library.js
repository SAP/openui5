sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario13.lib3",
		dependencies: [
			"testlibs.scenario13.lib4"
		],
		noLibraryCSS: true
	});
});