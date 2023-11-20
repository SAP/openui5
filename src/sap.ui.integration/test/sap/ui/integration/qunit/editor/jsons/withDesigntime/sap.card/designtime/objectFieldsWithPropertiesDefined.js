sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objectWithPropertiesDefined1": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined1/value",
						"type": "object",
						"label": "Object1 properties defined",
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
					},
					"objectWithPropertiesDefined2": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined2/value",
						"type": "object",
						"label": "Object2 properties defined",
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
					},
					"objectWithPropertiesDefined3": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined3/value",
						"type": "object",
						"label": "Object3 properties defined",
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
