sap.ui.controller("sap.ui.core.samples.routing.mobile.Tiles", {
	
	press: function(oEvent) {
		var oRouter = sap.ui.core.routing.Router.getRouter("app"),
			sSelected = oEvent.getParameter("id").split("--")[1],
			oHashChanger = sap.ui.core.routing.HashChanger.getInstance();

		oHashChanger.setHash(oRouter.getURL("_" + sSelected));
	}
	
});