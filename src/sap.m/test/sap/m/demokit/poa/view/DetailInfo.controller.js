sap.ui.controller("sap.ui.demo.poa.view.DetailInfo", {

	/**
	 * Initializes this controller
	 */
	onInit : function () {
		
		// subscribe for refresh events
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("app", "RefreshDetail", this._refresh, this);
	},
	
	/**
	 * Refreshes the view
	 */
	_refresh : function (channelId, eventId, data) {
		
		if (data && data.context) {
			
			// extend the context path of the detail for the detail info collection
			var sDetailInfoPath = data.context.getPath() + "Supplier";
			this.getView().bindElement(sDetailInfoPath);
		}
	}
});