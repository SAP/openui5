sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value",
						"type": "object",
						"label": "Object properties defined: value from Json list",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 },
										{ "text": "text02", "key": "key02", "url": "http://sap.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2 },
										{ "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 },
										{ "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4 },
										{ "text": "text05", "key": "key05", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5 },
										{ "text": "text06", "key": "key06", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6 },
										{ "text": "text07", "key": "key07", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7 },
										{ "text": "text08", "key": "key08", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8 }
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "Key",
								"column": {
									"filterProperty": "key"
								}
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"type": "Icon"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"label": "URL Link",
									"filterProperty": "url",
									"defaultFilterOperator": "StartsWith"
								},
								"cell": {
									"type": "Link",
									"href": "{url}"
								}
							},
							"editable": {
								"label": "Editable",
								"defaultValue": false,
								"type": "boolean"
							},
							"int": {
								"label": "Integer",
								"defaultValue": 0,
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								},
								"column": {
									"hAlign": "Center",
									"width": "5rem",
									"label": "Integer",
									"filterProperty": "int",
									"defaultFilterOperator": "EQ",
									"filterType": "sap.ui.model.type.Integer"   //sap.ui.model.type
								}
							},
							"number": {
								"label": "Number",
								"defaultValue": 0.5,
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							}
						}
					},
					"objectWithPropertiesDefinedAndValueFromRequestedFile": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value",
						"type": "object",
						"label": "Object properties defined: value from requested file",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.local}}/objectWithRequestList.json"
								},
								"path": "/values"
							}
						},
						"properties": {
							"key": {
								"label": "Key",
								"column": {
									"filterProperty": "key"
								}
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"type": "Icon"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"additionalText": {
								"label": "Additional Text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							}
						}
					},
					"objectWithPropertiesDefinedAndValueFromODataRequest": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value",
						"type": "object",
						"label": "Object properties defined: value from OData Request",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value"
							},
							"allowAdd": true
						},
						"properties": {
							"CustomerID": {
								"label": "Customer ID",
								"column": {
									"filterProperty": "CustomerID",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"CompanyName": {
								"label": "Company Name",
								"column": {
									"width": "10rem",
									"filterProperty": "CompanyName",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"Country": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "Country",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"City": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "City",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"Address": {
								"column": {
									"width": "10rem",
									"filterProperty": "Address",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							}
						}
					}
				}
			}
		});
	};
});
