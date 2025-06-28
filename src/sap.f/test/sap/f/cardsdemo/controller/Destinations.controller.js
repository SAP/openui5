sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/Host",
	"sap/m/MessageToast"
], function (Controller, Host, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Destinations", {

		onInit: function () {
			const oHost = new Host({
				resolveDestination: function (sName) {
					switch (sName) {
						case "Northwind_V3":
							return Promise.resolve("https://services.odata.org/V3/Northwind/Northwind.svc");
						case "Northwind_V4":
							return Promise.resolve("https://services.odata.org/V4/Northwind/Northwind.svc");
						case "Navigation":
							return new Promise(function (resolve) {
								setTimeout(function () {
									resolve("https://some.domain.com");
								}, 10);
							});
						default:
							return null;
					}
				}
			});

			[
				"card1",
				"card2",
				"card3"
			].forEach((sCardId) => {
				this.getView().byId(sCardId).setHost(oHost);
			});
		}

	});
});