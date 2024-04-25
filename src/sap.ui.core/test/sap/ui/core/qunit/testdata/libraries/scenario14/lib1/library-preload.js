//@ui5-bundle testlibs/scenario14/lib1/library-preload.js
sap.ui.predefine("testlibs/scenario14/lib1/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario14/lib2/library",
	"testlibs/scenario14/lib5/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario14.lib1",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario14.lib2",
			"testlibs.scenario14.lib5"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario14/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario14.lib2\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario14.lib5\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});