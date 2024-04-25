//@ui5-bundle testlibs/scenario3/lib1/library-preload.js
sap.ui.predefine("testlibs/scenario3/lib1/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario3/lib2/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario3.lib1",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario3.lib2"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario3/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario3.lib2\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});