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
										{ "text": "text01", "icon1": "sap-icon://accept", "icon2": "sap-icon://accept", "iconcolor": "#031E48"},
										{ "text": "text02", "icon1": "sap-icon://cart", "icon2": "sap-icon://accept", "iconcolor": "#64E4CE"},
										{ "text": "text03", "icon1": "sap-icon://zoom-in", "icon2": "sap-icon://accept", "iconcolor": "#E69A17"},
										{ "text": "text04", "icon1": "sap-icon://accept", "icon2": "sap-icon://accept", "iconcolor": "#1C4C98"},
										{ "text": "text05", "icon1": "sap-icon://cart", "icon2": "sap-icon://accept", "iconcolor": "#8875E7"},
										{ "text": "text06", "icon1": "sap-icon://zoom-in", "icon2": "sap-icon://accept", "iconcolor": "#E69A17"},
										{ "text": "text07", "icon1": "sap-icon://cart", "icon2": "sap-icon://accept", "iconcolor": "#1C4C98"},
										{ "text": "text08", "icon1": "sap-icon://zoom-in", "icon2": "sap-icon://accept", "iconcolor": "#8875E7"}
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
							"icon1": {
								"label": "Icon1",
								"type": "icon"
							},
							"icon2": {
								"label": "Icon2",
								"type": "icon",
								"required": true
							},
							"icon3": {
								"label": "Icon3",
								"type": "icon",
								"allowFile": false
							}
						}
					}
				}
			}
		});
	};
});
