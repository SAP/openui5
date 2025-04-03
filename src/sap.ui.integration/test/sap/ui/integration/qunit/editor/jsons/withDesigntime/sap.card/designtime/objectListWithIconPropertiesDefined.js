sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objectsWithPropertiesDefined": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithPropertiesDefined/value",
						"type": "object[]",
						"label": "Object properties defined",
						"properties": {
							"key": {
								"label": "Key",
								"column": {
									"filterProperty": "key"
								}
							},
							"icon1": {
								"label": "Icon1",
								"type": "Icon",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"color": "{iconcolor}"
								}
							},
							"icon2": {
								"label": "Icon2",
								"type": "Icon",
								"required": true,
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"color": "{iconcolor}"
								}
							},
							"icon3": {
								"label": "Icon3",
								"type": "icon",
								"allowFile": false,
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"color": "{iconcolor}"
								}
							},
							"icon4": {
								"label": "Icon4",
								"type": "Icon",
								"allowNone": false,
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"color": "{iconcolor}"
								}
							},
							"icon5": {
								"label": "Icon5",
								"type": "Icon",
								"required": true,
								"allowNone": true,
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"color": "{iconcolor}"
								}
							}
						}
					}
				}
			}
		});
	};
});
