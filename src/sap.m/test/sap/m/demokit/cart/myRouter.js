jQuery.sap.declare("sap.ui.demo.cart.myRouter");

sap.ui.demo.cart.myRouter = {

	/**
	 * to extend the router with a nav to method that
	 * does not write hashes but load the views properly
	 */
	_myNavToWithoutHash : function (sViewName, sViewType, bMaster, oData) {
		var oApp = sap.ui.getCore().byId("splitApp");
		var oView = this.getView(sViewName, sViewType);
		oApp.addPage(oView, bMaster);
		oApp.toDetail(oView.getId(), "show", oData);
	},

	/**
	 * navigates back if there was a previos navigation,
	 * if not, navigation back to home/welcome screen
	 */
	_myNavBack : function () {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var oPrevHash = oHistory.getPreviousHash();
		if (oPrevHash !== undefined) {
			window.history.go(-1);
		} else {
			this.navTo("home", {}, true);
		}
	}
};