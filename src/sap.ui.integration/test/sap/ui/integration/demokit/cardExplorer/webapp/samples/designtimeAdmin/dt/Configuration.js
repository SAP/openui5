sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"groupheader1": {
						"label": "General Settings",
						"type": "group"
					},
					"separator1": {
						"type": "separator"
					},
					"title": {
						"manifestpath": "/sap.card/configuration/parameters/title/value",
						"type": "string",
						"translatable": true,
						"label": "Card Title",
						"cols": 1,
						"allowDynamicValues": true
					},
					"subtitle": {
						"manifestpath": "/sap.card/configuration/parameters/subtitle/value",
						"type": "string",
						"translatable": true,
						"label": "Card Subtitle",
						"cols": 1,
						"allowDynamicValues": true
					},
					"headericon": {
						"manifestpath": "/sap.card/configuration/parameters/headericon/src",
						"type": "string",
						"label": "Card Icon",
						"cols": 1,
						"allowDynamicValues": false,
						"allowSettings": false,
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						}
					},
					"separator2": {
						"type": "separator"
					},
					"maxItems": {
						"manifestpath": "/sap.card/configuration/parameters/maxItems/value",
						"type": "integer",
						"allowDynamicValues": false,
						"allowSettings": false,
						"editableToUser": true,
						"visibleToUser": true,
						"visualization": {
							"type": "Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 10,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});
