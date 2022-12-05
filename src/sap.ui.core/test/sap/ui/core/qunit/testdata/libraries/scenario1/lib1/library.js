sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario1.lib1",
		dependencies: [
			"testlibs.scenario1.lib3",
			"testlibs.scenario1.lib4",
			"testlibs.scenario1.lib5"
		],
		noLibraryCSS: true
	});
});