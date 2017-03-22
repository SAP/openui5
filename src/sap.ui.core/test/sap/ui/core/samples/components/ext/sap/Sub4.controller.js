sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var Sub4Controller = Controller.extend("samples.components.ext.sap.Sub4", {

		onInit: function() {
			jQuery.sap.log.info("Sub4 Controller onInit()");
		},

		onExit: function() {
			jQuery.sap.log.info("Sub4 Controller onExit()");
		},

		onBeforeRendering: function() {
			jQuery.sap.log.info("Sub4 Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			jQuery.sap.log.info("Sub4 Controller onAfterRendering()");
		},


		originalSAPAction: function() {
			alert("This is an original SAP Action");
		}

	});

	return Sub4Controller;

});
