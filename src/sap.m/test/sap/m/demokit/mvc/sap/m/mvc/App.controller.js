sap.ui.controller("sap.m.mvc.App", {

	onInit : function() {

		var view = this.getView();

		// to avoid scrollbars on desktop the root view must be set to block display
		view.setDisplayBlock(true);
		
		// Data is fetched here
		jQuery.ajax("Data.json", {   // load the data from a relative URL (the Data.json file in the same directory)
			dataType: "json",
			success: function(data){
				var oModel = new sap.ui.model.json.JSONModel(data);
				view.setModel(oModel);
			}
		});

		// remember the App Control
		this.app = view.byId("theApp");
		
		this.app.setHomeIcon({
			'phone' : 'img/57_iPhone_Desktop_Launch.png',
			'phone@2' : 'img/114_iPhone-Retina_Web_Clip.png',
			'tablet' : 'img/72_iPad_Desktop_Launch.png',
			'tablet@2' : 'img/144_iPad_Retina_Web_Clip.png',
			'favicon' : 'img/favicon.ico',
			'precomposed': false
		});
		
		// subscribe to event bus
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("nav", "to", this.navToHandler, this);
		bus.subscribe("nav", "back", this.navBackHandler, this);
	},

	navToHandler : function(channelId, eventId, data) {
		if (data && data.id) {
			// lazy load view
			if (this.app.getPage(data.id) === null) {
				jQuery.sap.log.info("now loading page '" + data.id + "'");
				this.app.addPage(sap.ui.jsview(data.id, "sap.m.mvc." + data.id));
			}
			// Navigate to given page (include bindingContext)
			this.app.to(data.id, data.data.context);
		} else {
			jQuery.sap.log.error("nav-to event cannot be processed. Invalid data: " + data);
		}
	},

	navBackHandler : function() {
		this.app.back();
	}

});