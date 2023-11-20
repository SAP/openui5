sap.ui.define([], function () {
	"use strict";

	return {
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
			"configuration": {
				"actionHandlers": {
					"submit": {
						"url": "./MOCK.json",
						"method": "GET",
						"parameters": {
							"status": "approved",
							"reason": "{form>/reason/key}",
							"reasonText": "{form>/reason/value}",
							"comment": "{form>/comment}"
						}
					}
				}
			},
			"data": {
				"json": {
					"reasons": [
						{
							"id": "reason1",
							"title": "Reason 1"
						},
						{
							"id": "reason2",
							"title": "Reason 2"
						}
					]
				}
			},
			"header": {
				"icon": {
					"initials": "JN"
				},
				"title": "Julia Neil",
				"subTitle": "Purchase Requisition"
			},
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"value": "15,000.00 EUR",
								"type": "Status",
								"state": "Information",
								"showStateIcon": true
							},
							{
								"value": "For Ultra Jet Super Highspeed"
							}
						]
					},
					{
						"alignment": "Stretch",
						"items": [
							{
								"value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi finibus ex nunc. Nunc quis mattis augue. Phasellus eu mollis ligula, eleifend hendrerit neque. "
							}
						]
					},
					{
						"alignment": "Stretch",
						"items": [
							{
								"id": "reason",
								"label": "Reason",
								"type": "ComboBox",
								"placeholder": "Select",
								"item": {
									"path": "/reasons",
									"template": {
										"key": "{id}",
										"title": "{title}"
									}
								},
								"validations": [
									{
										"required": true
									},
									{
										"restrictToPredefinedOptions": true,
										"message": "Only listed values are allowed"
									}
								]
							},
							{
								"id": "comment",
								"label": "Comment",
								"type": "TextArea",
								"rows": 4,
								"placeholder": "Comment",
								"validations": [
									{
										"required": true
									},
									{
										"minLength": 10,
										"maxLength": 200,
										"message": "Your comment should be between 10 and 200 characters.",
										"type": "Warning"
									}
								]
							},
							{
								"id": "e-mail",
								"label": "E-mail",
								"type": "TextArea",
								"rows": 1,
								"placeholder": "e-mail",
								"validations": [
									{
										"required": true
									},
									{
										"pattern": "^\\w+[\\w-+\\.]*\\@\\w+([-\\.]\\w+)*\\.[a-zA-Z]{2,}+$",
										"message": "You should enter a valid e-mail."
									}
								]
							}
						]
					}
				]
			},
			"footer": {
				"actionsStrip": [
					{
						"text": "Submit",
						"buttonType": "Accept",
						"actions": [
							{
								"enabled": "{= !${messages>/hasErrors}}",
								"type": "Submit"
							}
						]
					}
				]
			}
		}
	};
});
