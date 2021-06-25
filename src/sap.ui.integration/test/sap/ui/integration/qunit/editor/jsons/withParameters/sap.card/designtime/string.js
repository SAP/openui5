/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"editable": true,
						"values": {
							"data": {
								"json": [
									{ "text": "text1", "key": "key1", "additionalText": 2.6666, "icon": "sap-icon://accept" },
									{ "text": "text2", "key": "key2", "additionalText": 2.6666, "icon": "sap-icon://cart" },
									{ "text": "text3", "key": "key3", "additionalText": 2.6666, "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{= format.float(${additionalText}, {decimals:2, style:'short'})}",
								"icon": "{icon}"
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
