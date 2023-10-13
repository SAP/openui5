sap.ui.predefine("testlibs/scenario14/lib2/library",[
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"testlibs/scenario14/lib3/library",
	"testlibs/scenario14/lib6/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario14.lib2",
		dependencies: [
			"testlibs.scenario14.lib3",
			"testlibs.scenario14.lib6"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario14/lib2/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario14.lib3\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario14.lib5\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\",\n\t\t\t\t\t\"lazy\": true\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario14.lib6\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});