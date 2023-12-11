sap.ui.predefine("testlibs/scenario15/lib8/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario15/lib6/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario15.lib8",
		dependencies: [
			"testlibs.scenario15.lib6"
		],
		noLibraryCSS: true
	});
});
sap.ui.require.preload({
	"testlibs/scenario15/lib8/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario15.lib6\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
});