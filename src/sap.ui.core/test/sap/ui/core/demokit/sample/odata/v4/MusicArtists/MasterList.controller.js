sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.MusicArtists.MasterList", {
		onCreate : function (oEvent) {
			var oEntityContext = this.getView().byId("artistList").getBinding("items")
					.create(undefined, true),
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oEntityContext.created().then(function () {
				oRouter.navTo("objectpage",
					{artistPath: oEntityContext.getCanonicalPath().substr(1)});
			});
		},

		onPress : function (oEvent) {
			var oItem = oEvent.getSource(),
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("objectpage",
				//remove the one and only '/' for routing to work
				{artistPath: oItem.getBindingContext().getCanonicalPath().substr(1)});
		},

		onRefresh : function () {
			this.getView().byId("artistList").getBinding("items").refresh();
		}
	});
});
