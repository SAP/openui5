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
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
						"label": "String Array",
						"defaultValue": ["key1", "key2"],
						"type": "string[]",
						"editable": true,
						"values": {
							"data": {
								"json": [
									{ "text": "abc", "key": "key1", "additionalText": 2.6666, "icon": "sap-icon://accept" },
									{ "text": "fsf", "key": "key2", "additionalText": 2.6666, "icon": "sap-icon://cart" },
									{ "text": "dsf", "key": "key3", "additionalText": 2.6666, "icon": "sap-icon://zoom-in" }
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
