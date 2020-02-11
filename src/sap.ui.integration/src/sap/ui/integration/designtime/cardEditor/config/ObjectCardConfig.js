/*!
 * ${copyright}
 *
 * @private
 * @experimental
 */
sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/config/generateActionConfig"
], function (
	generateActionConfig
) {
	"use strict";

	return {
		// Object Card
		"objectGroups": {
			"tags": ["content"],
			"label": "{i18n>CARD_EDITOR.OBJECT.GROUPS}",
			"type": "array",
			"path": "content/groups",
			"itemLabel": "{i18n>CARD_EDITOR.OBJECT.GROUP}",
			"template": {
				"title": {
					"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.TITLE}",
					"type": "string",
					"path": "title"
				},
				"items": {
					"tags": ["content", "objectGroup"],
					"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEMS}",
					"type": "array",
					"path": "items",
					"itemLabel": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM}",
					"template": {
						"icon": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.ICON}",
							"type": "icon",
							"path": "icon/src"
						},
						"label": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.LABEL}",
							"type": "string",
							"path": "label"
						},
						"value": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.VALUE}",
							"type": "string",
							"path": "value"
						},
						"type": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.TYPE}",
							"type": "enum",
							"enum": [
								"phone",
								"email",
								"link",
								"text"
							],
							"default": "text",
							"path": "type"
						},
						"url": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.URL}",
							"type": "string",
							"path": "url"
						},
						"target": {
							"tags": ["content", "objectGroupItem"],
							"label": "{i18n>CARD_EDITOR.OBJECT.GROUP.ITEM.TARGET}",
							"type": "enum",
							"enum": [
								"_blank",
								"_self"
							],
							"default": "_blank",
							"path": "target"
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
