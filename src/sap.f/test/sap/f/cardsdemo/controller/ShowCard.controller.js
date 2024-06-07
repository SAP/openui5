sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/Host"
], function (Controller, Host) {
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
		}

	});
});