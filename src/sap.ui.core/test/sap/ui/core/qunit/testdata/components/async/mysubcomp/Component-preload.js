jQuery.sap.registerPreloadedModules({
"name":"sap/test/mysubcomp/Component-preload",
"version":"2.0",
"modules":{
	"sap/test/mysubcomp/Component.js":function(){
jQuery.sap.declare("sap.test.mysubcomp.Component");
sap.ui.core.Component.extend("sap.test.mysubcomp.Component", {
	metadata : {
		libs : ['sap.test.lib4'],
	}
});
}
}});

