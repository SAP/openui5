sap.ui.define(['jquery.sap.global', 'sap/ui/core/Component'],
	function(jQuery, Component1) {
	"use strict";

	var Component = Component1.extend("sap.test.mycomp.Component", {
		metadata : {
			libs : ['sap.test.lib2', 'sap.test.lib3'],
			components : ['sap.test.mysubcomp']
		}
	});


	return Component;

});
