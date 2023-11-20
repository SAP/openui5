sap.ui.define([], function () {
	"use strict";

	return {
		"_version": "1.15.0",
		"sap.app": {
			"id": "",
			"type": "card",
			"title": "Sample of an Object Card",
			"subTitle": "Sample of an Object Card",
			"applicationVersion": {
				"version": "1.0.0"
			},
			"shortTitle": "A short title for this Card",
			"info": "Additional information about this Card",
			"description": "A long description for this Card",
			"tags": {
				"keywords": [
					"Object",
					"Card",
					"Sample"
				]
			}
		},
		"sap.ui": {
			"technology": "UI5",
			"icons": {
				"icon": "sap-icon://switch-classes"
			}
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"firstName": "Donna",
					"lastName": "Moore",
					"position": "Sales Executive",
					"phone": "+1 202 555 5555",
					"email": "my@mymail.com",
					"phoneTooltip": "Make a call",
					"emailTooltip": "Write an e-mail",
					"agendaTooltip": "Open a calendar",
					"photo": "./images/DonnaMoore.png",
					"agendaUrl": "/agenda",
					"manager": {
						"firstName": "Alain",
						"lastName": "Chevalier",
						"photo": "./images/AlainChevalier.png"
					},
					"company": {
						"name": "Robert Brown Entertainment",
						"address": "481 West Street, Anytown OH 45066, USA",
						"email": "mail@mycompany.com",
						"emailTooltip": "Write an e-mail",
						"websiteTooltip": "Visit website",
						"emailSubject": "Subject",
						"website": "www.company_a.example.com",
						"url": "https://www.company_a.example.com"
					}
				}
			},
			"header": {
				"icon": {
					"src": "{photo}"
				},
				"title": "{firstName} {lastName}",
				"subTitle": "{position}"
			},
			"content": {
				"groups": [
					{
						"title": "Contact Details",
						"items": [
							{
								"label": "Name",
								"value": "{firstName} {lastName}"
							},
							{
								"label": "Phone",
								"value": "{phone}",
								"tooltip": "{phoneTooltip}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "tel:{phone}"
										}
									}
								]
							}
						]
					},
					{
						"title": "Company Details",
						"items": [
							{
								"label": "Company Name",
								"value": "{company/name}"
							},
							{
								"label": "Email",
								"value": "{company/email}",
								"tooltip": "{company/emailTooltip}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "mailto:{company/email}?subject={company/emailSubject}"
										}
									}
								]
							}
						]
					},
					{
						"title": "Organizational Details",
						"items": [{
							"label": "Direct Manager",
							"value": "{manager/firstName} {manager/lastName}",
							"icon": {
								"src": "{manager/photo}"
							}
						}]
					}
				]
			}
		}
	};
});