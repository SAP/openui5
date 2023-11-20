// add your copyright here

sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"DataGotFromExtensionRequest": {
						"manifestpath": "/temp/configuration/parameters/DataGotFromExtensionRequest/value",
						"type": "string",
						"values": {
							"data": {
								"extension": {
									"method": "getData"
								},
								"path": "/values"
							},
							"item": {
								"text": "{trainer}",
								"key": "{title}",
								"additionalText": "{location}"
							}
						}
					},
					"DataGotFromEditorExtension": {
						"manifestpath": "/temp/configuration/parameters/DataGotFromEditorExtension/value",
						"type": "string",
						"values": {
							"item":{
								"text":"{trainer}",
								"key":"{title}",
								"additionalText":"{location}"
							},
							"path":"/values"
						}
					}
				}
			},
			"preview": {
				"modes": "AbstractLive"
			}
		});
	};
});
