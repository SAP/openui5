sap.ui.predefine("testlibs/scenario1/lib6/library",[
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario1.lib6",
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario1/lib6/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
});