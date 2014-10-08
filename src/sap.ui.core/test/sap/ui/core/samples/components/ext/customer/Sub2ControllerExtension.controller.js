sap.ui.controller("samples.components.ext.customer.Sub2ControllerExtension", {
	
	onInit: function() {
		jQuery.sap.log.info("Sub2ControllerExtension Controller onInit()");
	},
	
	onExit: function() {
		jQuery.sap.log.info("Sub2ControllerExtension Controller onExit()");
	},
	
	onBeforeRendering: function() {
		jQuery.sap.log.info("Sub2ControllerExtension Controller onBeforeRendering()");
	},
	
	onAfterRendering: function() {
		jQuery.sap.log.info("Sub2ControllerExtension Controller onAfterRendering()");
	},
	
	
	customerAction: function() {
		alert("This is a customer Action");
	}
	
});