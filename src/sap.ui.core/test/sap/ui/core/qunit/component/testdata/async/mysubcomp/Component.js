sap.ui.define(['jquery.sap.global', 'sap/ui/core/Component'],
	function(jQuery, Component1) {
	"use strict";

	var Component = Component1.extend("sap.test.mysubcomp.Component", {
		metadata : {
			libs : ['sap.test.lib4']
		}
	});


	return Component;

});
