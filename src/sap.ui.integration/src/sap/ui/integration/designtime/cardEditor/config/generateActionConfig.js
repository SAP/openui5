/*!
 * ${copyright}
 *
 * @function
 * @private
 * @experimental
 */
sap.ui.define(function () {
	"use strict";

	return function (aTags, sRelativePath) {
		return  {
			"tags": aTags,
			"label": "{i18n>CARD_EDITOR.ACTIONS}",
			"type": "array",
			"path": sRelativePath + "actions",
			"itemLabel": "{i18n>CARD_EDITOR.ACTION}",
			"template": {
				"enabled": {
					"label": "{i18n>CARD_EDITOR.ACTION.ENABLED}",
					"type": "boolean",
					"defaultValue": true,
					"path": sRelativePath + "actions/:index/enabled"
				},
				"type": {
					"label": "{i18n>CARD_EDITOR.ACTION.TYPE}",
					"type": "enum",
					"enum": ["Navigation"],
					"defaultValue": "Navigation",
					"path": sRelativePath + "actions/:index/type",
					"visible": false // Deactivated as Navigation is currently the only option
				},
				"service": {
					"label": "{i18n>CARD_EDITOR.ACTION.SERVICE}",
					"type": "string",
					"path": sRelativePath + "actions/:index/service",
					"visible": false // Currently undocumented
				},
				// "parameters": {
				// 	"label": "{i18n>CARD_EDITOR.ACTION.PARAMETERS}",
				// 	"type": "parameters",
				// 	"path": sRelativePath + "actions/:index/parameters"
				// },
				"target": {
					"label": "{i18n>CARD_EDITOR.ACTION.TARGET}",
					"type": "enum",
					"enum": [
						"_blank",
						"_self"
					],
					"defaultValue": "_blank",
					"path": sRelativePath + "actions/:index/target"
				},
				"url": {
					"label": "{i18n>CARD_EDITOR.ACTION.URL}",
					"type": "string",
					"path": sRelativePath + "actions/:index/url"
				}
			}
		};
	};
});
