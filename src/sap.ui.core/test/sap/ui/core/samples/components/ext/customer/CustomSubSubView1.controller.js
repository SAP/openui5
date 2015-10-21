sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery/*, Controller*/) {
	"use strict";

	sap.ui.controller("samples.components.ext.customer.CustomSubSubView1", {
	
		onInit: function() {
			jQuery.sap.log.info("CustomSubSubView1 Controller onInit()");
		},
	
		formatNumber: function(iNumber) {
			return "[ext" + iNumber + "]";
		}
	
	});

});
