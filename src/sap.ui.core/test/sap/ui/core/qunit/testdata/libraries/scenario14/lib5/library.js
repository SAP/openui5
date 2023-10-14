sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"testlibs/scenario14/lib7/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario14.lib5",
		dependencies: [
			"testlibs.scenario14.lib7"
		],
		noLibraryCSS: true
	});
});