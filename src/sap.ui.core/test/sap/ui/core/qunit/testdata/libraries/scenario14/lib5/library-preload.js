sap.ui.predefine("testlibs/scenario14/lib5/library",[
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"testlibs/scenario14/lib7/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario14.lib5",
		dependencies: [
			"testlibs.scenario14.lib7"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario14/lib5/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario14.lib7\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});