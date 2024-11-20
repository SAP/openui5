sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/Host",
	"sap/m/MessageToast"
], function (Controller, Host, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ShowCard", {

		onInit: function () {
			var oHost = new Host({
				resolveDestination: function (sName) {
					switch (sName) {
						case "Northwind_V4":
							return Promise.resolve("https://services.odata.org/V4/Northwind/Northwind.svc");
						default:
							return null;
					}
				}
			});

			this.getView().byId("showCard1").setHost(oHost);
			this.getView().byId("showCard2").setHost(oHost);
			this.getView().byId("showCard6").setHost(oHost);
			this.getView().byId("showCard8").setHost(oHost);

			var oHostWithActions = new Host({
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

			this.getView().byId("showCard7").setHost(oHostWithActions);
		}

	});
});