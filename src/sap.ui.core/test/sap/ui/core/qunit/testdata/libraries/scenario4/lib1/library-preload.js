sap.ui.predefine("testlibs/scenario4/lib1/library",[
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario4.lib1",
		dependencies: [
			"testlibs.scenario4.lib2"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario4/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario4.lib2\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});