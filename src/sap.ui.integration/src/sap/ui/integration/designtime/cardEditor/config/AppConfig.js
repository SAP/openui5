/*!
 * ${copyright}
 *
 * @private
 * @experimental
 */
sap.ui.define(function () {
	"use strict";

	return {
		"appId": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.ID}",
			"type": "string",
			"maxLength": 70,
			"path": "/sap.app/id"
		},
		"appVersion": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.VERSION}",
			"type": "string",
			"path": "/sap.app/applicationVersion/version"
		},
		"appTitle": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.TITLE}",
			"type": "string",
			"path": "/sap.app/title"
		},
		"appSubTitle": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.SUBTITLE}",
			"type": "string",
			"path": "/sap.app/subTitle"
		},
		"appShortTitle": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.SHORTTITLE}",
			"type": "string",
			"path": "/sap.app/shortTitle"
		},
		"appInfo": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.INFO}",
			"type": "string",
			"path": "/sap.app/info"
		},
		"appIcon": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.ICON}",
			"type": "simpleicon",
			"path": "/sap.ui/icons/icon"
		},
		"appDescription": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.DESCRIPTION}",
			"type": "string",
			"path": "/sap.app/description"
		},
		"appI18n": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.I18N}",
			"type": "string",
			"path": "/sap.app/i18n",
			"defaultValue": "i18n/i18n.properties"
		},
		"appTagKeywords": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.TAGS.KEYWORDS}",
			"type": "list",
			"path": "/sap.app/tags/keywords"
		},
		"appTagTechnicalAttributes": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.TAGS.TECHNICALATTRIBUTES}",
			"type": "list",
			"path": "/sap.app/tags/technicalAttributes",
			"validators": {
				"technicalAttributesPattern": {
					"type": "patternList",
					"config": {
						"pattern": "^[A-Z0-9_\\-\\/]+$"
					}
				}
			}
		},
		"mobile": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.MOBILE}",
			"type": "boolean",
			"defaultValue": "",
			"path": "/sap.platform.mobilecards/compatible"
		}
	};
});
