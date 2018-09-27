sap.ui.predefine('testlibs/scenario4/lib1/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario4.lib1',
		dependencies: [
			'testlibs.scenario4.lib2'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario4.lib1; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario4.lib1",
	"modules":{
		"testlibs/scenario4/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario4.lib2\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
	}
});