sap.ui.predefine('testlibs/scenario5/lib2/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario5.lib2',
		dependencies: [
			'testlibs.scenario5.lib3',
			'testlibs.scenario5.lib5'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario5.lib2; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario5.lib2",
	"modules":{
		"testlibs/scenario5/lib2/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario5.lib3\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario5.lib6\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\",\n\t\t\t\t\t\"lazy\": true\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario5.lib5\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
	}
});