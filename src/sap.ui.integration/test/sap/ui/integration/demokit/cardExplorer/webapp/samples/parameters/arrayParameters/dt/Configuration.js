sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"title": {
						"label": "Title",
						"manifestpath": "/sap.card/header/title"
					},
					"visibleCompanyFields": {
						"manifestpath": "/sap.card/configuration/parameters/visibleCompanyFields/value",
						"label": "Visible Company Fields",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"json": [
									{"key": "cName", "text": "companyName"},
									{"key": "cDetails", "text": "companyDetails"}
								]
							},
							"item": {
								"text": "{text}",
								"key": "{key}"
							}
						}
					},
					"teamMembers": {
						"manifestpath": "/sap.card/configuration/parameters/teamMembers/value",
						"label": "Team Members",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"json": [
									{"key": "p1", "text": "Alain Chevalier"},
									{"key": "p2", "text": "Donna Moore"}
								]
							},
							"item": {
								"text": "{text}",
								"key": "{key}"
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
