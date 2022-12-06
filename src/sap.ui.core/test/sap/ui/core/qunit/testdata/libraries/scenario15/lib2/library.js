sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario15.lib2",
		dependencies: [
			"testlibs.scenario15.lib4",
			"testlibs.scenario15.lib1",
			"testlibs.scenario15.lib7"
		],
		noLibraryCSS: true
	});
});