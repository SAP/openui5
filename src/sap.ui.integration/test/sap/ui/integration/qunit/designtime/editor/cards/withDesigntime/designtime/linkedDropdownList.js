// add your copyright here

sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"Customer": {
						"manifestpath": "/sap.card/configuration/parameters/Customer/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value/"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefind ? ${Country} + ', ' +  ${City} + ', ' + ${Address}: ''}"
							}
						}
					},
					"Employee": {
						"manifestpath": "/sap.card/configuration/parameters/Employee/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Employees",
									"parameters": {
										"$select": "EmployeeID, FirstName, LastName, Country, Title, HomePhone"
									}
								},
								"path": "/value/"
							},
							"item": {
								"text": "{FirstName} {LastName}",
								"key": "{EmployeeID}",
								"additionalText": "{= ${EmployeeID} !== undefind ? ${Country} + ', ' +  ${Title} + ', ' + ${HomePhone}: ''}"
							}
						}
					},
					"Order": {
						"manifestpath": "/sap.card/configuration/parameters/Order/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Orders",
									"parameters": {
										"$select": "OrderID, OrderDate, CustomerID, EmployeeID",
										"$filter": "(CustomerID eq '{items>Customer/value}') and (EmployeeID eq {items>Employee/value})"
									}
								},
								"path": "/value/"
							},
							"item": {
								"text": "{= ${OrderID} !== undefind ? ${OrderID} + '-' +  ${CustomerID} + '-' + ${EmployeeID}: ''}",
								"key": "{OrderID}",
								"additionalText": "{OrderDate}"
							}
						}
					},
					"Product": {
						"manifestpath": "/sap.card/configuration/parameters/Product/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Order_Details",
									"parameters": {
										"$expand": "Product",
										"$filter": "OrderID eq {items>Order/value}"
									}
								},
								"path": "/value/"
							},
							"item": {
								"text": "{= ${OrderID} !== undefind ? ${OrderID} + '-' +  ${ProductID} + ':' + ${Product/ProductName}: ''}",
								"key": "{ProductID}",
								"additionalText": "{= ${OrderID} !== undefind ? ${UnitPrice} + ' USD, count: '+ ${Quantity}: ''}"
							}
						}
					},
					"CustomerWithTopAndSkipOption": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithTopAndSkipOption/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$skip": "5",
										"$top": "5"
									}
								},
								"path": "/value/"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefind ? ${Country} + ', ' +  ${City} + ', ' + ${Address}: ''}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
