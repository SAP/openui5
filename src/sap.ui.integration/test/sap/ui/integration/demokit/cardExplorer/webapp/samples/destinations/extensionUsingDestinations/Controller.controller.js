sap.ui.define([
		'sap/ui/core/mvc/Controller',
		"sap/base/Log",
		'sap/ui/integration/Host'
	], function(Controller, Log, Host) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.extensionUsingDestinations.Controller", {

		onInit: function () {
			var oHost = new Host({
				resolveDestination: function(sDestinationName) {
					switch (sDestinationName) {
						case "Northwind":
							return "https://services.odata.org/V3/Northwind/Northwind.svc";
							// or with a promise
							// return Promise.resolve("https://services.odata.org/V3/Northwind/Northwind.svc");
						case "NorthwindImages":
							// Simulate path to images. In real use case it will be the same as the path to 'Northwind'.
							return window.location.origin + "/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/samples/images/";
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