sap.ui.predefine("testlibs/scenario8/lib3/library",[
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario8.lib3",
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario8/lib3/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
});