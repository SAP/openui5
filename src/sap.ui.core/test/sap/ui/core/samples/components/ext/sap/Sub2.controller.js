sap.ui.controller("samples.components.ext.sap.Sub2", {
	
	onInit: function() {
		jQuery.sap.log.info("Sub2 Controller onInit()");
		
		
		// create some dummy JSON data
		var data = {names:[
			{name: "Anton"},
			{name: "Karl"},
			{name: "Hermann"}
		]};
		
		// create a Model and assign it to the View
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(data);
		this.getView().setModel(oModel);
	},
	
	onExit: function() {
		jQuery.sap.log.info("Sub2 Controller onExit()");
	},
	
	onBeforeRendering: function() {
		jQuery.sap.log.info("Sub2 Controller onBeforeRendering()");
	},
	
	onAfterRendering: function() {
		jQuery.sap.log.info("Sub2 Controller onAfterRendering()");
	},
	
	
	originalSAPAction: function() {
		alert("This is an original SAP Action");
	}

});