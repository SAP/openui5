sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objectWithSpecialPropertiesDefined": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithSpecialPropertiesDefined/value",
						"type": "object",
						"label": "Object with special properties defined",
						"properties": {
							"key": {
								"label": "Key",
								"column": {
									"filterProperty": "key"
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
							"type": {
								"label": "Type",
								"type": "string",
								"values": {
									"data": {
										"json": {
											"values": [
												{ "text": "Type 01", "key": "type01"},
												{ "text": "Type 02", "key": "type02"},
												{ "text": "Type 03", "key": "type03"},
												{ "text": "Type 04", "key": "type04"},
												{ "text": "Type 05", "key": "type05"},
												{ "text": "Type 06", "key": "type06"}
											]
										},
										"path": "/values"
									},
									"item": {
										"text": "{text}",
										"key": "{key}"
									}
								}
							},
							"object": {
								"label": "Object",
								"type": "object",
								"column": {
									"hAlign": "Center",
									"width": "10rem"
								}
							}
						}
					}
				}
			}
		});
	};
});
