sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objectWithPropertiesDefined": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined/value",
						"type": "object",
						"label": "Object properties defined",
						"properties": {
							"key": {
								"label": "Key"
							},
							"icon": {
								"label": "Icon"
							},
							"text": {
								"label": "Text",
								"translatable": true
							},
							"url": {
								"label": "URL"
							},
							"editable": {
								"label": "Editable",
								"type": "boolean"
							},
							"int": {
								"label": "Integer",
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								}
							},
							"number": {
								"label": "Number",
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							}
						}
					}
				}
			}
		});
	};
});
