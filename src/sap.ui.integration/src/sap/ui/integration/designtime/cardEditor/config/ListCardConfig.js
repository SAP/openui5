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
		// List Card
		"listMaxItems": {
			"tags": ["content"],
			"label": "{i18n>CARD_EDITOR.LIST.MAXITEMS}",
			"type": "number",
			"path": "content/maxItems",
			"visible": "{= ${context>type} === 'List' }"
		},

		// List Card Item
		"listItemTitle": {
			"tags": ["content", "listItem"],
			"label": "{i18n>CARD_EDITOR.LIST_ITEM.TITLE}",
			"type": "string",
			"path": "content/item/title",
			"visible": "{= ${context>type} === 'List' }"
		},
		"listItemDescription": {
			"tags": ["content", "listItem"],
			"label": "{i18n>CARD_EDITOR.LIST_ITEM.DESCRIPTION}",
			"type": "string",
			"path": "content/item/description",
			"visible": "{= ${context>type} === 'List' }"
		},
		"listItemInfoValue": {
			"tags": ["content", "listItem"],
			"label": "{i18n>CARD_EDITOR.LIST_ITEM.INFO.VALUE}",
			"type": "string",
			"path": "content/item/info/value",
			"visible": "{= ${context>type} === 'List' }"
		},
		"listItemInfoState": {
			"tags": ["content", "listItem"],
			"label": "{i18n>CARD_EDITOR.LIST_ITEM.INFO.STATE}",
			"type": "enum",
			"enum": [
				"Success",
				"Error",
				"Warning",
				"None",
				"Information"
			],
			"defaultValue": "None",
			"path": "content/item/info/state",
			"visible": "{= ${context>type} === 'List' }"
		},
		"listItemHighlight": {
			"tags": ["content", "listItem"],
			"label": "{i18n>CARD_EDITOR.LIST_ITEM.HIGHLIGHT}",
			"type": "string",
			"path": "content/item/highlight",
			"visible": "{= ${context>type} === 'List' }"
		},
		"listItemIcon": {
			"tags": ["content", "listItem"],
			"label": "{i18n>CARD_EDITOR.LIST_ITEM.ICON}",
			"type": "icon",
			"path": "content/item/icon/src",
			"visible": "{= ${context>type} === 'List' }"
		},
		"listItemActions": generateActionConfig({
			"tags": ["content", "listItem"],
			"path": "content/item/actions",
			"maxItems": 1,
			"visible": "{= ${context>type} === 'List' }"
		})
	};
});
