jQuery.sap.declare("sap.ui.demo.poa.MyRouter");

sap.ui.demo.poa.MyRouter = {

	/**
	 * to monkey patch the router with the mobile nav back handling
	 */
	myNavBack : function (route, data) {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sUrl = this.getURL(route, data);
		var sDirection = oHistory.getDirection(sUrl);
		if ("Backwards" === sDirection) {
			window.history.go(-1);
		} else {
			var bReplace = true; // otherwise we go backwards with a forward history
			this.navTo(route, data, bReplace);
		}
	},

	/**
	 * to monkey patch the router with a nav to method that
	 * does not write hashes but load the views properly
	 */
	myNavToWithoutHash : function (viewName, viewType, master, data) {
		var oApp = sap.ui.getCore().byId("splitApp");
		var oView = this.getView(viewName, viewType);
		oApp.addPage(oView, master);
		oApp.toDetail(oView.getId(), "show", data);
	}
};