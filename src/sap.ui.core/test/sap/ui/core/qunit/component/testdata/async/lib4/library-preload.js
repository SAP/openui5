//@ui5-bundle sap/test/lib4/library-preload.js
sap.ui.predefine("sap/test/lib4/library", ['sap/ui/core/Lib'],
	function(Library) {
	"use strict";

	return Library.init({
		name:"sap.test.lib4",
		apiVersion:2,
		noLibraryCSS:true
	});
});
sap.ui.require.preload({
	"version":"2.0",
	"name":"sap.test.lib4",
	"modules":{
		"sap/test/lib4/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
	}
});