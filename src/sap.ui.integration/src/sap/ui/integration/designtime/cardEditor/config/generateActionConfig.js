/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_merge"
], function (
	_merge
) {
	"use strict";

	/**
	* Generate a customized configuration object for card actions.
	* @param {object} oCustomConfig - Object with the desired configuration customizations to be applied to the generated config.
	* @param {string} oCustomConfig.path - Action binding path
	* @param {string[]} [oCustomConfig.tags] - Property tags
	* @param {string|boolean} [oCustomConfig.visible] - Visibility condition expression
	* @param {number} [oCustomConfig.maxItems] - Maximum amount of actions
	* @returns {object} Card action configuration object
	* @function
	* @experimental
	* @private
	*/

	return function (oCustomConfig) {
		return _merge({}, {
			"label": "{i18n>CARD_EDITOR.ACTIONS}",
			"type": "array",
			"itemLabel": "{type}",
			"addItemLabel": "{i18n>CARD_EDITOR.ACTION}",
			"template": {
				"enabled": {
					"label": "{i18n>CARD_EDITOR.ACTION.ENABLED}",
					"type": "boolean",
					"defaultValue": true,
					"path": "enabled"
				},
				"type": {
					"label": "{i18n>CARD_EDITOR.LABEL.TYPE}",
					"type": "select",
					"items": [
						{
							"key": "Navigation"
						},
						{
							"key": "Custom"
						}
					],
					"path": "type",
					"visible": "{= !!${enabled}}"
				},
				"service": {
					"label": "{i18n>CARD_EDITOR.ACTION.SERVICE}",
					"type": "string",
					"path": "service",
					"visible": false // Currently undocumented
				},
				"parameters": {
					"label": "{i18n>CARD_EDITOR.PARAMETERS}",
					"type": "map",
					"allowedTypes": ["string", "number", "boolean"],
					"path": "parameters",
					"visible": "{= !!${enabled}}"
				},
				"url": {
					"label": "{i18n>CARD_EDITOR.LABEL.URL}",
					"type": "string",
					"path": "url",
					"visible": "{= !!${enabled} && ${type} === 'Navigation'}"
				},
				"target": {
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
					"visible": "{= !!${enabled} && ${type} === 'Navigation' && !!${url}}"
				}
			}
		}, oCustomConfig);
	};
});
