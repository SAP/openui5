//@ui5-bundle testlibs/scenario4/lib1/library-preload.js
sap.ui.predefine("testlibs/scenario4/lib1/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario4/lib2/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario4.lib1",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario4.lib2"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario4/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario4.lib2\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});