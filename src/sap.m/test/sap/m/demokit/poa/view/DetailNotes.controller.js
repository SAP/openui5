sap.ui.controller("sap.ui.demo.poa.view.DetailNotes", {

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
	}
});