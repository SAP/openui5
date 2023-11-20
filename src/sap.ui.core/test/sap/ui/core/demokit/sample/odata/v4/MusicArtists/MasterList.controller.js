sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./Routing"
], function (Controller, Routing) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.MusicArtists.MasterList", {
		onCreate : function () {
			var oEntityContext = this.getView().byId("Artists").getBinding("items")
					.create(undefined, true),
				that = this;

			oEntityContext.created().then(function () {
				Routing.navigateToArtist(that, oEntityContext);
			});
		},

		onRefresh : function () {
			this.getView().byId("Artists").getBinding("items").refresh();
		},

		onSelect : function (oEvent) {
			Routing.navigateToArtist(this, oEvent.getSource().getBindingContext());
		}
	});
});
