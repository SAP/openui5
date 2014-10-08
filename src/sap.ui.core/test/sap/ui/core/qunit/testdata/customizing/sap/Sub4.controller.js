sap.ui.controller("testdata.customizing.sap.Sub4", {
	
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