sap.ui.controller("sap.ui.core.samples.routing.mobile.Master", {

	onInit: function() {
		var oRouter = sap.ui.core.routing.Router.getRouter("app"),
			that = this;

		oRouter.attachRouteMatched(function(oEvent) {
			if (oEvent.getParameter("name") == "_testapp_detail") {
				var oArguments = oEvent.getParameter("arguments"),
					oItem = that.getView().byId("masterList").getItems()[parseInt(oArguments.selectedIndex,10)];
				
				if (oItem) {
					oItem.setSelected(true);
				}
			}
		});
	},
	
	select: function(oEvent) {
		var oListItem = oEvent.getParameter("listItem"),
			oRouter = sap.ui.core.routing.Router.getRouter("app"),
			oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
		
		oHashChanger.setHash(oRouter.getURL("_testapp_detail", {
			selectedIndex: oListItem.getParent().indexOfItem(oListItem)
		}));
	}

});