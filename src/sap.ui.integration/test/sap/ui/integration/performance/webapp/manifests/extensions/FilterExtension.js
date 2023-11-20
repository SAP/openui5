sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var FilterExtension = Extension.extend("cards.performance.manifests.extensions.FilterExtension");

	FilterExtension.prototype.getData = function () {
		return Promise.resolve([{
			"OrderID": 10248,
			"CustomerID": "VINET",
			"EmployeeID": 5,
			"OrderDate": "1996-07-04T00:00:00Z",
			"RequiredDate": "1996-08-01T00:00:00Z",
			"ShippedDate": "1996-07-16T00:00:00Z",
			"ShipVia": 3,
			"Freight": 32.3800,
			"ShipName": "Vins et alcools Chevalier",
			"ShipAddress": "59 rue de l'Abbaye",
			"ShipCity": "Reims",
			"ShipRegion": null,
			"ShipPostalCode": "51100",
			"ShipCountry": "France"
		},
		{
			"OrderID": 10311,
			"CustomerID": "DUMON",
			"EmployeeID": 1,
			"OrderDate": "1996-09-20T00:00:00Z",
			"RequiredDate": "1996-10-04T00:00:00Z",
			"ShippedDate": "1996-09-26T00:00:00Z",
			"ShipVia": 3,
			"Freight": 24.6900,
			"ShipName": "Du monde entier",
			"ShipAddress": "67, rue des Cinquante Otages",
			"ShipCity": "Nantes",
			"ShipRegion": null,
			"ShipPostalCode": "44000",
			"ShipCountry": "France"
		},
		{
			"OrderID": 10340,
			"CustomerID": "BONAP",
			"EmployeeID": 1,
			"OrderDate": "1996-10-29T00:00:00Z",
			"RequiredDate": "1996-11-26T00:00:00Z",
			"ShippedDate": "1996-11-08T00:00:00Z",
			"ShipVia": 3,
			"Freight": 166.3100,
			"ShipName": "Bon app'",
			"ShipAddress": "12, rue des Bouchers",
			"ShipCity": "Marseille",
			"ShipRegion": null,
			"ShipPostalCode": "13008",
			"ShipCountry": "France"
		}]);
	};

	return FilterExtension;
});