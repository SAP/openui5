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
						"label": "Object properties defined: value from Json list",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 },
										{ "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2 },
										{ "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 },
										{ "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4 },
										{ "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5 },
										{ "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6 },
										{ "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7 },
										{ "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8 }
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "{{TRANSLATED_KEY}}",
								"column": {
									"filterProperty": "key",
									"width": "10rem"
								}
							},
							"icon": {
								"label": "{i18n>TRANSLATED_ICON}",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "10rem"
								},
								"cell": {
									"type": "Icon"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"translatable": true,
								"column": {
									"hAlign": "Center",
									"width": "10rem",
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
					"objectWithPropertiesDefined2": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined2/value",
						"type": "object",
						"label": "Object properties defined: value from Json list",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 },
										{ "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2 },
										{ "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 },
										{ "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4 },
										{ "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5 },
										{ "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6 },
										{ "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7 },
										{ "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8 }
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "{{TRANSLATED_KEY}}",
								"column": {
									"filterProperty": "key",
									"width": "10rem"
								}
							},
							"icon": {
								"label": "{i18n>TRANSLATED_ICON}",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "10rem"
								},
								"cell": {
									"type": "Icon"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"translatable": true,
								"column": {
									"hAlign": "Center",
									"width": "10rem",
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
					"objectWithPropertiesDefined3": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined3/value",
						"type": "object",
						"label": "Object properties defined: value from Json list",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 },
										{ "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2 },
										{ "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 },
										{ "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4 },
										{ "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5 },
										{ "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6 },
										{ "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7 },
										{ "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8 }
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "{{TRANSLATED_KEY}}",
								"column": {
									"filterProperty": "key",
									"width": "10rem"
								}
							},
							"icon": {
								"label": "{i18n>TRANSLATED_ICON}",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "10rem"
								},
								"cell": {
									"type": "Icon"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"translatable": true,
								"column": {
									"hAlign": "Center",
									"width": "10rem",
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
					}
				}
			}
		});
	};
});
