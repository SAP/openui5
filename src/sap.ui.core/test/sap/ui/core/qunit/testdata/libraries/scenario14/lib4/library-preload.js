sap.ui.predefine('testlibs/scenario14/lib4/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario14.lib4',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario14.lib4; // eslint-disable-line no-undef
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario14.lib4",
	"modules":{
		"testlibs/scenario14/lib4/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
	}
});