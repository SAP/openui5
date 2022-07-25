/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_merge",
	"sap/ui/integration/designtime/cardEditor/config/generateActionConfig",
	"sap/m/ButtonType"
], function (
	_merge,
	generateActionConfig,
	ButtonType
) {
	"use strict";

	/**
	* Generate a customized configuration object for card footer.
	* @param {object} oCustomConfig - Object with the desired configuration customizations to be applied to the generated config.
	* @param {string} oCustomConfig.path - Action binding path
	* @param {string[]} [oCustomConfig.tags] - Property tags
	* @param {string|boolean} [oCustomConfig.visible] - Visibility condition expression
	* @returns {object} Card footer configuration object
	* @function
	* @experimental
	* @private
	*/

	return function (oCustomConfig) {
		return _merge({}, {
			"label": "{i18n>CARD_EDITOR.ACTIONS.STRIP}",
			"type": "array",
			"itemLabel": "{type}",
			"addItemLabel": "{i18n>CARD_EDITOR.ACTION.STRIP}",
			"template": {
				"type": {
					"label": "{i18n>CARD_EDITOR.ACTION.STRIP.TYPE}",
					"type": "select",
					"items": [
						{
							"key": "Button"
						},
						{
							"key": "ToolbarSpacer"
						}
					],
					"path": "type"
				},
				"actions": generateActionConfig({
					"path": "actions"
				}),
				"overflowPriority": {
					"label": "{i18n>CARD_EDITOR.ACTION.STRIP.OVERFLOWPRIORITY}",
					"type": "select",
					"items": [
						{
							"key": "Always"
						},
						{
							"key": "AlwaysOverflow"
						},
						{
							"key": "Disappear"
						},
						{
							"key": "High"
						},
						{
							"key": "Low"
						},
						{
							"key": "Never"
						},
						{
							"key": "NeverOverflow"
						}
					],
					"path": "overflowPriority"
				},
				"icon": {
					"label": "{i18n>CARD_EDITOR.ACTION.STRIP.ICON}",
					"type": "string",
					"path": "icon"
				},
				"text": {
					"label": "{i18n>CARD_EDITOR.ACTION.TEXT}",
					"type": "string",
					"path": "text"
				},
				"tooltip": {
					"label": "{i18n>CARD_EDITOR.ACTION.STRIP.TOOLTIP}",
					"type": "string",
					"path": "tooltip"
				},
				"buttonType": {
					"label": "{i18n>CARD_EDITOR.ACTION.STRIP.BUTTON.TYPE}",
					"type": "select",
					"visible": "{= ${type} === 'Button'}",
					"items": [
						{
							"key": "Accept"
						},
						{
							"key": "Attention"
						},
						{
							"key": "Back"
						},
						{
							"key": "Critical"
						},
						{
							"key": "Default"
						},
						{
							"key": "Emphasized"
						},
						{
							"key": "Ghost"
						},
						{
							"key": "Negative"
						},
						{
							"key": "Neutral"
						},
						{
							"key": "Reject"
						},
						{
							"key": "Success"
						},
						{
							"key": "Transparent"
						},
						{
							"key": "Unstyled"
						},
						{
							"key": "Up"
						}
					],
					"path": "buttonType"
				},
				"ariaHasPopup": {
					"label": "{i18n>CARD_EDITOR.ACTION.ARIAHASPOPUP}",
					"type": "select",
					"items": [
						{
							"key": "Dialog"
						},
						{
							"key": "Grid"
						},
						{
							"key": "ListBox"
						},
						{
							"key": "Menu"
						},
						{
							"key": "None"
						},
						{
							"key": "Tree"
						}
					],
					"path": "ariaHasPopup"
				},
				"visible": {
					"label": "{i18n>CARD_EDITOR.ACTION.VISIBLE}",
					"type": "boolean",
					"defaultValue": true,
					"path": "visible"
				}
			}
		}, oCustomConfig);
	};
});
