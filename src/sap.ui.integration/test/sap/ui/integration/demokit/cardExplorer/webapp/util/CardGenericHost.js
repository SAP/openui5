sap.ui.define(["sap/ui/integration/Host"], function (Host) {
	"use strict";

	// Generic Host to be used by all cards in the Samples, besides application samples.
	var oHost = new Host({
		resolveDestination: function (sName) {
			switch (sName) {
				case "local":
					return "./";
				case "Northwind_V2":
					return Promise.resolve("https://services.odata.org/V2/Northwind/Northwind.svc");
				case "Northwind_V3":
					return Promise.resolve("https://services.odata.org/V3/Northwind/Northwind.svc");
				case "Northwind_V4":
					return Promise.resolve("https://services.odata.org/V4/Northwind/Northwind.svc");
				case "ProductsMockServer":
					return Promise.resolve("/SEPMRA_PROD_MAN/");
				default:
					return null;
			}
		}
	});

	oHost.getDestinations = function () {
		return Promise.resolve([
			{
				name: "Northwind_V2"
			},
			{
				name: "Northwind_V3"
			},
			{
				name: "Northwind_V4"
			},
			{
				name: "ProductsMockServer"
			}
		]);
	};

	return oHost;
});