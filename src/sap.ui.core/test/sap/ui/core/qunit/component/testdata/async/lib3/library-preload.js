sap.ui.predefine("sap/test/lib3/library", ['sap/test/lib2/library'],
function() {
"use strict";

sap.ui.getCore().initLibrary({
	name:"sap.test.lib3",
	noLibraryCSS:true
});

});
sap.ui.require.preload({
	"version":"2.0",
	"name":"sap.test.lib3",
	"modules":{
		"sap/test/lib3/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {\n\t\t\t\"sap.test.lib2\": {}\n\t\t}\n\t\t}\n\t}\n}"
	}
});