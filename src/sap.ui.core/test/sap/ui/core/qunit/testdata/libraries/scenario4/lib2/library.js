sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario4.lib2",
		dependencies: [
			"testlibs.scenario4.lib1"
		],
		noLibraryCSS: true
	});
});