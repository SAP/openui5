sap.ui.define([
	"sap/ui/integration/widgets/Card"
], function (Card) {
	"use strict";

	var oManifest = {
		"sap.app": {
			"type": "card",
			"i18n": "i18n/i18n.properties",
			"id": "my.card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "{{appTitle}}",
				"subTitle": "{{appDescription}}",
				"icon": {
					"src": "./icons/edit.png"
				}
			}
		}
	};

	var sManifestUrl = "./bundle/manifest.json";

	var oCard = new Card({
		width: "400px",
		height: "auto",
		manifest: oManifest,
		baseUrl: "./bundle/"
	});
	var oCard2 = new Card({
		width: "400px",
		height: "auto",
		manifest: sManifestUrl
	});
	oCard.placeAt("content");
	oCard2.placeAt("content");
});