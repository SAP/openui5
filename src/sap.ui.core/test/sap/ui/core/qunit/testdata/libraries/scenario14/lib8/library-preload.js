sap.ui.predefine('testlibs/scenario14/lib8/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario14.lib8',
		dependencies: [
			'testlibs.scenario14.lib1'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario14.lib8; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario14.lib8",
	"modules":{
		"testlibs/scenario14/lib8/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario14.lib1\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
	}
});