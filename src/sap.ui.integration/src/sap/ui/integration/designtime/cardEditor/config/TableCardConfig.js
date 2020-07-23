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
		// Table Card
		"tableMaxItems": {
			"tags": ["content"],
			"label": "{i18n>CARD_EDITOR.MAXITEMS}",
			"type": "integer",
			"path": "content/maxItems",
			"visible": "{= ${context>type} === 'Table' }"
		},
		"tableRowColumns": {
			"tags": ["content", "tableRow"],
			"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMNS}",
			"type": "array",
			"path": "content/row/columns",
			"itemLabel": "{title}",
			"addItemLabel": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN}",
			"template": {
				"title": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TITLE}",
					"type": "string",
					"path": "title"
				},
				"width": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN.WIDTH}",
					"type": "string",
					"path": "width"
				},
				"value": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN.VALUE}",
					"type": "string",
					"path": "value"
				},
				"icon": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.ICON}",
					"type": "icon",
					"path": "icon",
					"visible": false
				},
				"state": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN.STATE}",
					"type": "select",
					"items": [
						{
							"key": "Success",
							"title": "{i18n>CARD_EDITOR.STATE.SUCCESS}"
						},
						{   "key": "Error",
							"title": "{i18n>CARD_EDITOR.STATE.ERROR}"
						},
						{
							"key": "Warning",
							"title": "{i18n>CARD_EDITOR.STATE.WARNING}"
						},
						{
							"key": "None",
							"title": "{i18n>CARD_EDITOR.STATE.NONE}"
						},
						{
							"key": "Information",
							"title": "{i18n>CARD_EDITOR.STATE.INFORMATION}"
						}
					],
					"defaultValue": "None",
					"path": "state"
				},
				"url": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.LABEL.URL}",
					"type": "string",
					"path": "url"
				},
				"target": {
					"tags": ["content", "tableRowColumn"],
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
					"visible": "{= !!${url}}"
				},
				"identifier": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN.IDENTIFIER}",
					"type": "boolean",
					"defaultValue": false,
					"path": "identifier"
				},
				"progressIndicatorState": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN.PROGRESSINDICATOR.STATE}",
					"type": "select",
					"items": [
						{
							"key": "Success",
							"title": "{i18n>CARD_EDITOR.STATE.SUCCESS}"
						},
						{   "key": "Error",
							"title": "{i18n>CARD_EDITOR.STATE.ERROR}"
						},
						{
							"key": "Warning",
							"title": "{i18n>CARD_EDITOR.STATE.WARNING}"
						},
						{
							"key": "None",
							"title": "{i18n>CARD_EDITOR.STATE.NONE}"
						},
						{
							"key": "Information",
							"title": "{i18n>CARD_EDITOR.STATE.INFORMATION}"
						}
					],
					"defaultValue": "None",
					"path": "progressIndicator/state"
				},
				"progressIndicatorPercent": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN.PROGRESSINDICATOR.PERCENT}",
					"type": "number",
					"path": "progressIndicator/percent"
				},
				"progressIndicatorText": {
					"tags": ["content", "tableRowColumn"],
					"label": "{i18n>CARD_EDITOR.TABLE.ROW.COLUMN.PROGRESSINDICATOR.TEXT}",
					"type": "string",
					"path": "progressIndicator/text"
				}
			},
			"visible": "{= ${context>type} === 'Table' }"
		},
		"tableRowActions": generateActionConfig({
			"tags": ["content", "tableRow"],
			"path": "content/row/actions",
			"maxItems": 1,
			"visible": "{= ${context>type} === 'Table' }"
		})
	};
});
