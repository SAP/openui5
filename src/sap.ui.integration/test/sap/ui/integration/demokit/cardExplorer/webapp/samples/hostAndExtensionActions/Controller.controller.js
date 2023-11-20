sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/integration/Host"
], function(Controller, MessageToast, Host) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.hostAndExtensionActions.Controller", {
		onInit: function () {

			var oHost = new Host({
				actions: [
					{
						type: "Navigation",
						text: "Open SAP website",
						icon: "sap-icon://globe",
						url: "http://www.sap.com",
						target: "_blank"
					},
					{
						type: "Custom",
						text: "Add to Mobile",
						icon: "sap-icon://add",
						action: function (oCard, oButton) {
								MessageToast.show("Card successfully added to Mobile.");
						}
					}
				]
			});

			this.getView().byId("card1").setHost(oHost);
		}
	});
});