sap.ui.define([], function () {
	"use strict";

	return {
		"_version": "1.17.0",
		"sap.app": {
			"id": "",
			"type": "card",
			"title": "Sample of an Adaptive Card",
			"subTitle": "Sample of an Adaptive Card",
			"applicationVersion": {
				"version": "1.0.0"
			},
			"shortTitle": "A short title for this Card",
			"info": "Additional information about this Card",
			"description": "A long description for this Card",
			"tags": {
				"keywords": [
					"Adaptive",
					"Card",
					"Sample"
				]
			}
		},
		"sap.card": {
			"type": "AdaptiveCard",
			"data": {
				"json": {
					"firstName": "Donna",
					"lastName": "Moore",
					"position": "Sales Executive",
					"description": "Lorem ipsum dolor st amet, consetetur sadipscing elitr",
					"company": {
						"name": "Robert Brown Entertainment",
						"address": "481 West Street, Anytown OH 45066, USA"
					}
				}
			},
			"header": {
				"title": "{firstName} {lastName}",
				"subTitle": "{position}"
			},
			"content": {
				"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
				"type": "AdaptiveCard",
				"version": "1.0",
				"body": [
					{
						"type": "TextBlock",
						"text": "${description}",
						"wrap": true
					},
					{
						"type": "FactSet",
						"facts": [
							{
								"title": "First Name:",
								"value": "${firstName}"
							},
							{
								"title": "Last Name:",
								"value": "${lastName}"
							},
							{
								"title": "Company:",
								"value": "${company.name}"
							},
							{
								"title": "Address:",
								"value": "${company.address}"
							}
						]
					}
				]
			}
		}
	};
});