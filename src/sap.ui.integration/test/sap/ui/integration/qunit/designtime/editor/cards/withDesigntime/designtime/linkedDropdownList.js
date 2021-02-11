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
									"url": "{{destinations.mock_request}}/Customers"
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
									"url": "{{destinations.mock_request}}/Employees"
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
									"url": "{{destinations.mock_request}}/Orders",
									"parameters": {
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
									"url": "{{destinations.mock_request}}/Order_Details",
									"parameters": {
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
									"url": "{{destinations.mock_request}}/Customers",
									"parameters": {
										"$skip": "1",
										"$top": "2"
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
