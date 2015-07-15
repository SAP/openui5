sap.ui.controller("view.App", {

	onInit:function(){
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("nav","to",this.to, this);
		bus.subscribe("nav","back",this.back, this);

		// remember the App Control
		this.app = this.getView().byId("splitApp");
	},

	to:function(channel, event, data){
		// Set binding context to transfer data
		this.byId(data.id).setBindingContext(data.context, "rounds");
		
		// close master (in case of overlay)
		this.app.hideMaster();
		
		// Navigate to detail view
		this.app.to(this.createId(data.id));
	},
	
	back: function(channel, event, data){
		this.app.backDetail();
	}

});