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
			"label": "{i18n>CARD_EDITOR.APP.TITLE}",
			"type": "string",
			"path": "/sap.app/title"
		},
		"appSubTitle": {
			"tags": ["app"],
			"label": "{i18n>CARD_EDITOR.APP.SUBTITLE}",
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
			"path": "/sap.app/tags/technicalAttributes"
		},
		"appDataSources": {
			"label": "{i18n>CARD_EDITOR.APP.DATASOURCES}",
			"type": "complexMap",
			"itemLabel": "{i18n>CARD_EDITOR.APP.DATASOURCE}",
			"path": "/sap.app/dataSources",
			"template": {
				"key": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.KEY}",
					"type": "string",
					"path": "key"
				},
				"uri": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.URI}",
					"type": "string",
					"path": "uri"
				},
				"type": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.TYPE}",
					"type": "enum",
					"enum": [
						"OData",
						"ODataAnnotation",
						"INA",
						"XML",
						"JSON"
					],
					"defaultValue": "OData",
					"path": "type"
				},
				"odataVersion": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.ODATAVERSION}",
					"type": "enum",
					"enum": [
						"2.0",
						"4.0"
					],
					"defaultValue": "2.0",
					"path": "settings/odataVersion"
				},
				"localUri": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.LOCALURI}",
					"type": "string",
					"path": "settings/localUri"
				},
				"annotations": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.ANNOTATIONS}",
					"type": "list",
					"path": "settings/annotations"
				},
				"maxAge": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.MAXAGE}",
					"type": "number",
					"path": "settings/maxAge"
				}
			}
		}
	};
});
