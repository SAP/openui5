sap.ui.predefine('testlibs/scenario15/lib1/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario15.lib1',
		dependencies: [
			'testlibs.scenario15.lib3',
			'testlibs.scenario15.lib4'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario15.lib1; // eslint-disable-line no-undef
});
sap.ui.predefine('testlibs/scenario15/lib1/comp/Component',['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";
	return UIComponent.extend("testlibs.scenario15.lib1.comp.Component");
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario15.lib1",
	"modules":{
		"testlibs/scenario15/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario15.lib3\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario15.lib4\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario15.lib5\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\",\n\t\t\t\t\t\"lazy\": true\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}",
		"testlibs/scenario15/lib1/comp/manifest.json":"{\"_version\":\"1.12.0\",\"sap.app\":{\"id\":\"testlibs.scenario15.lib1.comp\",\"type\":\"application\",\"title\":\"comp\",\"applicationVersion\":{\"version\":\"1.0.0\"}}}"
	}
});