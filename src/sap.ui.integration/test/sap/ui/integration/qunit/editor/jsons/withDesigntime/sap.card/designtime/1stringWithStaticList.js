sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringWithStaticList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithStaticList/value",
						"type": "string",
						"allowDynamicValues": false,
						"allowSettings": true,
						"editableToUser": true,
						"visibleToUser": true,
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
										{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://accept" },
										{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
										{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://accept" },
										{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://cart" },
										{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
									]
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					}
				}
			}
		});
	};
});
