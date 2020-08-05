/*!
 * ${copyright}
 *
 * @private
 * @experimental
 */
sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/config/generateActionConfig",
	"sap/ui/integration/designtime/cardEditor/util/CommonPatterns"
], function (
	generateActionConfig,
	CommonPatterns
) {
	"use strict";

	return {
		// Object Card
		"objectGroups": {
			"tags": ["content"],
			"label": "{i18n>CARD_EDITOR.OBJECT.GROUPS}",
			"type": "array",
			"path": "content/groups",
			"itemLabel": "{title}",
			"addItemLabel": "{i18n>CARD_EDITOR.OBJECT.GROUP}",
			"template": {
				"title": {
					"label": "{i18n>CARD_EDITOR.TITLE}",
					"type": "string",
					"path": "title"
				},
				"items": {
					"tags": ["content", "objectGroup"],
					"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEMS}",
					"type": "array",
					"path": "items",
					"itemLabel": "{label}",
					"addItemLabel": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM}",
					"template": {
						"icon": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.ICON}",
							"type": "icon",
							"path": "icon"
						},
						"label": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.LABEL}",
							"type": "string",
							"path": "label"
						},
						"value": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.VALUE}",
							"type": "string",
							"path": "value",
							"validators": {
								"emailPattern": {
									"type": "pattern",
									"config": {
										"pattern": CommonPatterns.email,
										"modifiers": "i"
									},
									"errorMessage": "CARD_EDITOR.VALIDATOR.INVALID_EMAIL",
									"isEnabled": "{= ${type} === 'email'}"
								}
							}
						},
						"type": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.LABEL.TYPE}",
							"type": "select",
							"items": [
								{
									"key": "phone",
									"title": "{i18n>CARD_EDITOR.OBJECT.GROUP.TYPE.PHONE}"
								},
								{
									"key": "email",
									"title": "{i18n>CARD_EDITOR.OBJECT.GROUP.TYPE.EMAIL}"
								},
								{
									"key": "link",
									"title": "{i18n>CARD_EDITOR.OBJECT.GROUP.TYPE.LINK}"
								},
								{
									"key": "text",
									"title": "{i18n>CARD_EDITOR.OBJECT.GROUP.TYPE.TEXT}"
								}
							],
							"defaultValue": "text",
							"path": "type"
						},
						"url": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.LABEL.URL}",
							"type": "string",
							"path": "url",
							"visible": "{= ${type} === 'link'}"
						},
						"target": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.TARGET}",
							"type": "select",
							"items": [
								{
									"key":"_blank",
									"description": "{i18n>CARD_EDITOR.TARGET.BLANK}"
								},
								{
									"key":"_self",
									"description": "{i18n>CARD_EDITOR.TARGET.SELF}"
								}
							],
							"defaultValue": "_blank",
							"path": "target",
							"visible": "{= ${type} === 'link' && !!${url}}"
						},
						"emailSubject": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.EMAILSUBJECT}",
							"type": "string",
							"path": "emailSubject",
							"visible": "{= ${type} === 'email'}"
						}
					}
				}
			},
			"visible": "{= ${context>type} === 'Object' }"
		},
		"objectActions": generateActionConfig({
			"tags": ["content"],
			"path": "content/actions",
			"maxItems": 1,
			"visible": "{= ${context>type} === 'Object' }"
		})
	};
});
