sap.ui.define([], function () {
	"use strict";

	return {
		"sap.app": {
			"type": "card",
			"id": ""
		},
		"sap.card": {
			"extension": "./extensions/CustomFormattersExtension",
			"configuration": {
				"parameters": {
					"suffix": {
						"value": "{{parameters.TODAY_ISO}}"
					}
				}
			},
			"data": {
				"json": [{
						"training": "Scrum",
						"location": "Online"
					},
					{
						"training": "Quality Management",
						"location": "Classroom Attendance"
					},
					{
						"training": "Test Driven Development",
						"location": "Classroom Attendance"
					},
					{
						"training": "Integration Cards Training",
						"location": "Online"
					}
				]
			},
			"type": "List",
			"header": {
				"title": "Available Trainings",
				"icon": {
					"src": "sap-icon://activities"
				}
			},
			"content": {
				"item": {
					"title": "{= extension.formatters.toUpperCase(${training}) }",
					"description": "{= extension.formatters.appendSuffix(${location}) }"
				}
			}
		}
	};
});