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
		"appDataSources": {
			"label": "{i18n>CARD_EDITOR.APP.DATASOURCES}",
			"type": "complexMap",
			"itemLabel": "{key}",
			"addItemLabel": "{i18n>CARD_EDITOR.APP.DATASOURCE}",
			"path": "/sap.app/dataSources",
			"template": {
				"key": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.KEY}",
					"type": "string",
					"path": "key",
					"validators": {
						"keyPattern": {
							"type": "pattern",
							"config": {
								"pattern": "^[a-zA-Z0-9_\\.\\-]*$"
							}
						}
					}
				},
				"uri": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.URI}",
					"type": "string",
					"path": "uri"
				},
				"type": {
					"label": "{i18n>CARD_EDITOR.LABEL.TYPE}",
					"type": "select",
					"items": [
						{ "key": "OData" },
						{ "key": "ODataAnnotation" },
						{ "key": "INA" },
						{ "key": "XML" },
						{ "key": "JSON" },
						{ "key": "FHIR" }
					],
					"defaultValue": "OData",
					"path": "type"
				},
				"odataVersion": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.ODATAVERSION}",
					"type": "select",
					"items": [
						{ "key": "2.0" },
						{ "key": "4.0" }
					],
					"defaultValue": "2.0",
					"path": "settings/odataVersion",
					"visible": "{= ${type} === 'OData' || ${type} === 'ODataAnnotation'}"
				},
				"localUri": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.LOCALURI}",
					"type": "string",
					"path": "settings/localUri",
					"visible": "{= ${type} === 'OData' || ${type} === 'ODataAnnotation'}"
				},
				"annotations": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.ANNOTATIONS}",
					"type": "list",
					"path": "settings/annotations",
					"visible": "{= ${type} === 'OData' || ${type} === 'ODataAnnotation'}"
				},
				"maxAge": {
					"label": "{i18n>CARD_EDITOR.APP.DATASOURCES.SETTINGS.MAXAGE}",
					"type": "number",
					"path": "settings/maxAge"
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
