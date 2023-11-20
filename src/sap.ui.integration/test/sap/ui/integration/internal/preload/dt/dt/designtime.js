sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";

	var AdvancedDesigntime = Designtime.extend("card.test.AdvancedDesigntime");
	AdvancedDesigntime.prototype.create = function () {
		return {
			"form": {
				"items": {
					"groupheader1": {
						"label": "General Settings",
						"type": "group"
					},
					"title": {
						"manifestpath": "/sap.card/header/title",
						"type": "string",
						"translatable": true,
						"label": "Card Title",
						"cols": 1
					},
					"subtitle": {
						"manifestpath": "/sap.card/header/subTitle",
						"type": "string",
						"translatable": true,
						"label": "Card Subtitle",
						"cols": 1
					},
					"headericon": {
						"manifestpath": "/sap.card/header/icon/src",
						"type": "string",
						"label": "Card Icon",
						"cols": 1
					}
				}
			},
			"preview": {
				"modes": "Abstract"
			}
		};
	};
	return AdvancedDesigntime;
});


