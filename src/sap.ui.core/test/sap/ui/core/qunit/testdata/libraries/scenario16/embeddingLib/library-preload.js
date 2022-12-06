sap.ui.predefine("testlibs/scenario16/embeddingLib/library",[
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(oCore) {
	"use strict";
	return oCore.initLibrary({
		name: "testlibs.scenario16.embeddingLib",
		dependencies: [
		],
		noLibraryCSS: true
	});
});
sap.ui.predefine("testlibs/scenario16/embeddingLib/embeddedComponent/Component",[
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";
	return UIComponent.extend("testlibs.scenario16.embeddingLib.embeddedComponent.Component");
});
sap.ui.require.preload({
	"testlibs/scenario16/embeddingLib/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}",
	"testlibs/scenario16/embeddingLib/embeddedComponent/manifest.json":"{\"_version\":\"1.12.0\",\"sap.app\":{\"id\":\"testlibs.scenario16.embeddingLib.embeddedComponent\",\"type\":\"application\",\"title\":\"embeddedComponent\",\"applicationVersion\":{\"version\":\"1.0.0\"},\"embeddedBy\":\"../\"}}"
});