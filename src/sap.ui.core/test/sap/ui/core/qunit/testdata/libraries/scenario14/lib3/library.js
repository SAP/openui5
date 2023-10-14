sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"testlibs/scenario14/lib4/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario14.lib3",
		dependencies: [
			"testlibs.scenario14.lib4"
		],
		noLibraryCSS: true
	});
});