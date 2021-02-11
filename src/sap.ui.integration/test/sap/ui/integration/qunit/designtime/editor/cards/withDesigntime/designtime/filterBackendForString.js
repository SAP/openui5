// add your copyright here

sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"CustomerWithFilterParameter": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithFilterParameter/value",
						"label": "Customer with filter parameter",
						"type": "string",
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
					"CustomerWithFilterInURL": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithFilterInURL/value",
						"type": "string",
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
					"CustomerWithFilterParamAndColumn": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithFilterParamAndColumn/value",
						"type": "string",
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
					"CustomerWithFilterColumn": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithFilterColumn/value",
						"type": "string",
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
					"EmployeeWithFilterColumns": {
						"manifestpath": "/sap.card/configuration/parameters/EmployeeWithFilterColumns/value",
						"type": "string",
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
