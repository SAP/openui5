sap.ui.define([
		'sap/ui/core/mvc/Controller',
		"sap/base/Log",
		'sap/ui/integration/Host'
	], function(Controller, Log, Host) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.Destinations.Destinations", {

		onInit: function () {
			var oHost = new Host({
				resolveDestination: function(sDestinationName) {
					switch (sDestinationName) {
						case "Northwind":
							return "https://services.odata.org/V3/Northwind/Northwind.svc";
							// or with a promise
							// return Promise.resolve("https://services.odata.org/V3/Northwind/Northwind.svc");
						default:
							Log.error("Unknown destination.");
						break;
					}
				}
			});

			this.getView().byId('card1').setHost(oHost);
		}
	});
});