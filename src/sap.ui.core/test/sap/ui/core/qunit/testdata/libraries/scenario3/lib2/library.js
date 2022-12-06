sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario3.lib2",
		dependencies: [
			"testlibs.scenario3.lib3",
			"testlibs.scenario3.lib4"
		],
		noLibraryCSS: true
	});
});