jQuery.sap.registerPreloadedModules({
"name":"sap/test/mycomp/Component-preload",
"version":"2.0",
"modules":{
	"sap/test/mycomp/Component.js":function(){
jQuery.sap.declare("sap.test.mycomp.Component");
sap.ui.core.Component.extend("sap.test.mycomp.Component", {
	metadata : {
		libs : ['sap.test.lib2', 'sap.test.lib3'],
		components : ['sap.test.mysubcomp']
	}
});
}
}});

