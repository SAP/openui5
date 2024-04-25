//@ui5-bundle testlibs/scenario15/lib1/library-preload.js
sap.ui.predefine("testlibs/scenario15/lib1/library",[
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario15/lib3/library",
	"testlibs/scenario15/lib4/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario15.lib1",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario15.lib3",
			"testlibs.scenario15.lib4"
		],
		noLibraryCSS: true
	});
});
sap.ui.predefine("testlibs/scenario15/lib1/comp/Component",[
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";
	return UIComponent.extend("testlibs.scenario15.lib1.comp.Component");
});
sap.ui.require.preload({
	"testlibs/scenario15/lib1/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\t\"testlibs.scenario15.lib3\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario15.lib4\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\"\n\t\t\t\t},\n\t\t\t\t\"testlibs.scenario15.lib5\": {\n\t\t\t\t\t\"minVersion\": \"1.0.0\",\n\t\t\t\t\t\"lazy\": true\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}",
	"testlibs/scenario15/lib1/comp/manifest.json":"{\"_version\":\"1.12.0\",\"sap.app\":{\"id\":\"testlibs.scenario15.lib1.comp\",\"type\":\"application\",\"title\":\"comp\",\"applicationVersion\":{\"version\":\"1.0.0\"}}}"
});