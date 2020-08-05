sap.ui.predefine('testlibs/scenario14/lib7/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario14.lib7',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario14.lib7; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario14.lib7",
	"modules":{
		"testlibs/scenario14/lib7/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
	}
});