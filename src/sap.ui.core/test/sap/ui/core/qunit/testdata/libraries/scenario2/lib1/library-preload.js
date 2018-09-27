sap.ui.predefine('testlibs/scenario2/lib1/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario2.lib1',
		dependencies: [
			'testlibs.scenario2.lib3',
			'testlibs.scenario2.lib4',
			'testlibs.scenario2.lib5'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario2.lib1; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario2.lib1",
	"modules":{
		"testlibs/scenario2/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario2.lib3\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario2.lib4\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario2.lib5\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
	}
});