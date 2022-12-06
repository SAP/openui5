sap.ui.predefine("testlibs/scenario15/lib9/library",[
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario15.lib9",
		dependencies: [
			"testlibs.scenario15.lib10"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario15/lib9/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario15.lib10\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});