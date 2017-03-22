sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	return Controller.extend("testdata.customizing.sap.Sub6", {

		onInit: function() {
			jQuery.sap.log.info("Sub6 Controller onInit()");
			oLifecycleSpy("Sub6 Controller onInit()");
		},

		onExit: function() {
			jQuery.sap.log.info("Sub6 Controller onExit()");
			oLifecycleSpy("Sub6 Controller onExit()");
		},

		onBeforeRendering: function() {
			jQuery.sap.log.info("Sub6 Controller onBeforeRendering()");
			oLifecycleSpy("Sub6 Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			jQuery.sap.log.info("Sub6 Controller onAfterRendering()");
			oLifecycleSpy("Sub6 Controller onAfterRendering()");
		},


		originalSAPAction: function() {
			alert("This is an original SAP Action");
		}

	});

});
