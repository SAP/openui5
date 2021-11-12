// add your copyright here

sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"booleanVisualization": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"type": "boolean",
						"label": "Boolean Label using Switch",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"CustomerWithVisibleDependent": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithVisibleDependent/value",
						"type": "string",
						"visible": "{items>booleanVisualization/value}",
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
					"CustomersWithVisibleDependent": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithVisibleDependent/value",
						"type": "string[]",
						"visible": "{items>booleanVisualization/value}",
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
					"CustomersInMultiInputWithVisibleDependent": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersInMultiInputWithVisibleDependent/value",
						"type": "string[]",
						"visible": "{items>booleanVisualization/value}",
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
						},
						"visualization": {
							"type": "MultiInput"
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
