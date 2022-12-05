sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario5.lib2",
		dependencies: [
			"testlibs.scenario5.lib3",
			"testlibs.scenario5.lib5"
		],
		noLibraryCSS: true
	});
});