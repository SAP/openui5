sap.ui.predefine('testlibs/scenario8/lib5/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario8.lib5',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario8.lib5; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario8.lib5",
	"modules":{
		"testlibs/scenario8/lib5/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
	}
});