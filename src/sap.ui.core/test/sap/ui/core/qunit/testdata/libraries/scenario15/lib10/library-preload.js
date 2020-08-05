sap.ui.predefine('testlibs/scenario15/lib10/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario15.lib10',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario15.lib10; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario15.lib10",
	"modules":{
		"testlibs/scenario15/lib10/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
	}
});