jQuery.sap.registerPreloadedModules({
"name":"sap/test/manifestcomp/Component-preload",
"version":"2.0",
"modules":{
	"sap/test/manifestcomp/manifest.json": "{\"sap.app\":{\"id\":\"sap.test.manifestcomp\"},\"sap.ui5\":{\"dependencies\":{\"libs\":{\"sap.test.lib2\":{},\"sap.test.lib3\":{\"lazy\":true},\"sap.test.lib4\":{\"lazy\":false}},\"components\":{\"sap.test.mycomp\":{},\"sap.test.mysubcomp\":{\"lazy\":true}}}}}",
	"sap/test/manifestcomp/Component.js":function(){
jQuery.sap.declare("sap.test.manifestcomp.Component");
sap.ui.core.Component.extend("sap.test.manifestcomp.Component", {
	metadata : {
		manifest: "json"
	}
});
}
}});
