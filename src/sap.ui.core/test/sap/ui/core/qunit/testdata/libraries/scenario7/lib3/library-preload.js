sap.ui.predefine('testlibs/scenario7/lib3/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario7.lib3',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario7.lib3; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario7.lib3",
	"modules":{
		"testlibs/scenario7/lib3/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
	}
});