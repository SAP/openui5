sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"title": {
						"label": "Title",
						"manifestpath": "/sap.card/header/title"
					},
					"products": {
                        "manifestpath": "/sap.card/configuration/parameters/products/value",
                        "label": "String Array (MultiInput)",
                        "type": "string[]",
                        "values": {
                           "data": {
								"request": {
									"url": "{{destinations.ProductsMockServerWithCSRF}}/Products",
									"parameters": {
										"$format": "json",
										"$top": 4
									},
									"method": "GET",
									"headers": {
										"X-CSRF-Token": "{csrfTokens>/token1/value}"
									}
								},
								"path": "/data"
							},
							"item": {
								"text":"{Name}",
								"key":"{Name}"
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