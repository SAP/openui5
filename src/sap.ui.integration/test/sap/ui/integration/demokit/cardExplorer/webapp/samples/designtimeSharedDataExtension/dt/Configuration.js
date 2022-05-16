sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringWithRequestExtensionList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithRequestExtensionList/value",
						"type": "string",
						"label": "String With Request Extension List",
						"values": {
							"data": {
								"extension": {
									"method": "getData"
								}
							},
							"item": {
								"text": "{trainer}",
								"key": "{title}",
								"additionalText": "{location}"
							}
						}
					},
					"stringWithDataFromExtensionList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithDataFromExtensionList/value",
						"type": "string",
						"label": "String With Data From Extension List",
						"values": {
							"item": {
								"text": "{trainer}",
								"key": "{title}",
								"additionalText": "{location}"
							}
						}
					},
					"stringWithRequestFromDestinationList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithRequestDestinationList/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.local}}/stringWithRequestList.json"
								},
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"maxItems": {
						"manifestpath": "/sap.card/configuration/parameters/maxItems/value",
						"type": "integer",
						"label": "Maximum Items"
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});
