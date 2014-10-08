sap.ui.controller("example.mvc.test", {
	

	onInit: function() {
		ok(true, "onInit is called now");
		window.onInitCalled = true;
		if(this.getView().getViewData()) {
			window.dataOnInit = this.getView().getViewData().test;
		}
		sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({
			"key": "value"
		}));
	},

	
	onBeforeRendering: function() {
		window.onBeforeRenderingCalled = true;
		if(this.getView().getViewData()) {
			window.dataBeforeRendering = this.getView().getViewData().test;
		}
	},
	
	
	onAfterRendering: function() {
		ok(true, "onAfterRendering is called now");
		window.onAfterRenderingCalled = true;
		if(this.getView().getViewData()) {
			window.dataAfterRendering = this.getView().getViewData().test;
		}
	},
	
	
	onExit: function() {
		window.onExitCalled = true;
	},
	
	doIt: function(oEvent) {
		ok(true, "Event of "+ oEvent.getSource().getId()+" executed in controller");
		controller = this;
		ok(controller instanceof sap.ui.core.mvc.Controller, "context for event handling must be instanceof sap.ui.core.mvc.Controller");
		if(this.getView().getViewData()) {
			window.dataEventHandler = this.getView().getViewData().test;
		}
	},
	
	valueFormatter: function(oValue) {
		return "formatted-" + oValue;
	}

});