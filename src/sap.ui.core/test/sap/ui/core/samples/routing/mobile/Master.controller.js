sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/core/routing/HashChanger', 'sap/ui/core/routing/Router'],
	function(Controller, HashChanger, Router) {
	"use strict";

	return Controller.extend("sap.ui.core.samples.routing.mobile.Master", {

		onInit: function() {
			var oRouter = Router.getRouter("app"),
				that = this;

			oRouter.attachRouteMatched(function(oEvent) {
				if (oEvent.getParameter("name") == "_testapp_detail") {
					var oArguments = oEvent.getParameter("arguments"),
						oItem = that.byId("masterList").getItems()[parseInt(oArguments.selectedIndex)];

					if (oItem) {
						oItem.setSelected(true);
					}
				}
			});
		},

		select: function(oEvent) {
			var oListItem = oEvent.getParameter("listItem"),
				oRouter = Router.getRouter("app"),
				oHashChanger = HashChanger.getInstance();

			oHashChanger.setHash(oRouter.getURL("_testapp_detail", {
				selectedIndex: oListItem.getParent().indexOfItem(oListItem)
			}));
		}

	});

});
