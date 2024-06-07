sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
      "preview": {
				"modes": "LiveAbstract"
			},
			"form": {
				"items": {

          "groupheader1": {
						"label": "Size Settings",
						"type": "group"
					},
          "separator1": {
						"type": "separator"
					},
					"displayVariant": {
						"manifestpath": "/sap.card/root/show",
						"type": "string",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "Header and Content", "key": "all", "additionalText": "", "icon": "sap-icon://header" },
										{ "text": "Header", "key": "header", "additionalText":"", "icon": "sap-icon://iphone-2" },
										{ "text": "Tile", "key": "tile", "additionalText":"", "icon": "sap-icon://border" }
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
            },
            "visualization": {
							"type": "Select",
							"settings": {
								"forceSelection": true,
								"editable": true,
								"visible": true,
								"showSecondaryValues": true
							}
						},
						"label": "Show",
						"cols": 2,
						"allowDynamicValues": true
					},
          "tileVariantSizes": {
						"manifestpath": "/sap.card/root/tileSize",
						"type": "string",
            "visible": "{= ${items>displayVariant/value} === 'tile'}",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "Standard", "key": "TileStandard"},
										{ "text": "Wide", "key": "TileStandardWide"},
										{ "text": "Small", "key": "TileFlat"},
										{ "text": "Small Wide", "key": "TileFlatWide"}
									]
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"icon": "{icon}"
							}
            },
						"label": "Tile Size",
						"cols": 2,
						"allowDynamicValues": false,
            "visualization": {
							"type": "Select",
							"settings": {
								"forceSelection": true,
								"editable": true,
								"visible": true,
								"showSecondaryValues": true
							}
						}
					},
          "headerVariantSizes": {
						"manifestpath": "/sap.card/root/headerSize",
						"type": "string",
            "visible": "{= ${items>displayVariant/value} === 'header'}",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "Compact", "key": "CompactHeader"},
										{ "text": "Small", "key": "SmallHeader"},
										{ "text": "Standard", "key": "StandardHeader"}
									]
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"icon": "{icon}"
							}
            },
						"label": "Header Size",
						"cols": 2,
						"allowDynamicValues": true,
            "visualization": {
							"type": "Select",
							"settings": {
								"forceSelection": true,
								"editable": true,
								"visible": true,
                "showSecondaryValues": true
							}
						}
					},
          "contentVariantSizes": {
						"manifestpath": "/sap.card/root/contentSize",
						"type": "string",
            "visible": "{= ${items>displayVariant/value} === 'all'}",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "Small", "key": "Small"},
										{ "text": "Standard", "key": "Standard"},
										{ "text": "Large", "key": "Large"}
									]
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}"
							}
            },
						"label": "Content Size",
            "cols": 2,
            "visualization": {
							"type": "Select",
							"settings": {
								"forceSelection": true,
								"editable": true,
								"visible": true,
								"showSecondaryValues": true
							}
						}
					},
					"groupheader2": {
						"label": "General Settings",
						"type": "group"
					},
					"separator2": {
						"type": "separator"
					},
					"title": {
						"manifestpath": "/sap.card/header/title",
						"type": "string",
						"translatable": true,
						"label": "Card Title",
						"cols": 1,
						"allowDynamicValues": true
					},
					"subtitle": {
						"manifestpath": "/sap.card/header/subTitle",
						"type": "string",
						"translatable": true,
						"label": "Card Subtitle",
						"cols": 1,
						"allowDynamicValues": true
					},
					"headericon": {
						"manifestpath": "/sap.card/header/icon/src",
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
					}
				}
			}
		});
	};
});
