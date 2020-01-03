sap.ui.define( ["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.RoutingFullscreen.routingApp.controller.View1", {
		onInit : function () {
			var sUrl = "#" + this.getOwnerComponent().getRouter().getURL("page2");
			this.byId("link").setHref(sUrl);
		},

		onToPage2 : function () {
			this.getOwnerComponent().getRouter().navTo("page2");
		}
	});

});
