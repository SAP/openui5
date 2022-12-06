sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario2.lib1",
		dependencies: [
			"testlibs.scenario2.lib3",
			"testlibs.scenario2.lib4",
			"testlibs.scenario2.lib5"
		],
		noLibraryCSS: true
	});
});