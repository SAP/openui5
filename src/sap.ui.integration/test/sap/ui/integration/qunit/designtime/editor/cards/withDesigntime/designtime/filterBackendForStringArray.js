// add your copyright here

sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"CustomersWithFilterParameter": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithFilterParameter/value",
						"label": "Customers with filter parameter",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Customers",
									"parameters": {
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"CustomersWithFilterInURL": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithFilterInURL/value",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Customers?$filter=startswith(CompanyName,'{currentSettings>suggestValue}')"
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"CustomersWithFilterParamAndColumn": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithFilterParamAndColumn/value",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Customers",
									"parameters": {
										"$filter": "CustomerID eq 'b'"
									}
								},
								"path": "/value",
								"filterBackend": {
									"operator": "startswith", //the operator value can be "contains", "not contains", "startswith" and "endswith", default is "contains".
									"columns": [
										"CompanyName"
									]
								}
							},
							"item": {
								"text": "{CompanyName}",
								"additionalText": "{= ${CustomerID} !== undefind ? ${Country} + ', ' +  ${City} + ', ' + ${Address}: ''}"
							}
						}
					},
					"CustomersWithFilterColumn": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithFilterColumn/value",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Customers"
								},
								"path": "/value",
								"filterBackend": {
									"operator": "startswith", //the operator value can be "contains", "not contains", "startswith" and "endswith", default is "contains".
									"columns": [
										"CompanyName"
									]
								}
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"EmployeesWithFilterColumns": {
						"manifestpath": "/sap.card/configuration/parameters/EmployeesWithFilterColumns/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Employees"
								},
								"path": "/value",
								"filterBackend": {
									"operator": "endswith",
									"columns": [
										"FirstName",
										"LastName"
									]
								}
							},
							"item": {
								"text": "{FirstName} {LastName}",
								"key": "{EmployeeID}",
								"additionalText": "{= ${EmployeeID} !== undefined ? ${Country} + ', ' +  ${Title} + ', ' + ${HomePhone} : ''}"
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
