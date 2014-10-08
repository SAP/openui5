sap.ui.controller("testdata.customizing.sap.Sub2", {
	
	onInit: function() {
		aLifeCycleCalls.push("Sub2 Controller onInit()");
		
		
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
		aLifeCycleCalls.push("Sub2 Controller onExit()");
	},
	
	onBeforeRendering: function() {
		aLifeCycleCalls.push("Sub2 Controller onBeforeRendering()");
	},
	
	onAfterRendering: function() {
		aLifeCycleCalls.push("Sub2 Controller onAfterRendering()");
	},
	
	
	originalSAPAction: function() {
		standardSub2ControllerCalled();
		return "ori";
	}

});