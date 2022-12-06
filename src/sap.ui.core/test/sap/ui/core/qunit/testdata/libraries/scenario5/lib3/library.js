sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario5.lib3",
		dependencies: [
			"testlibs.scenario5.lib6"
		],
		noLibraryCSS: true
	});
});