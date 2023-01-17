sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/core/routing/HashChanger', 'sap/ui/core/routing/Router'],
	function(Controller, HashChanger, Router) {
	"use strict";

	return Controller.extend("sap.ui.core.samples.routing.mobile.Tiles", {

		press: function(oEvent) {
			var oRouter = Router.getRouter("app"),
				sSelected = oEvent.getParameter("id").split("--")[1],
				oHashChanger = HashChanger.getInstance();

			oHashChanger.setHash(oRouter.getURL("_" + sSelected));
		}

	});

});
