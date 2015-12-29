jQuery.sap.declare("sap.test.mycomp.Component");
sap.ui.core.Component.extend("sap.test.mycomp.Component", {
	metadata : {
		libs : ['sap.test.lib2', 'sap.test.lib3'],
		components : ['sap.test.mysubcomp']
	}
});
