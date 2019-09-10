/*!
 * ${copyright}
 *
 * @constructor
 * @private
 * @experimental
 */
sap.ui.define([
],
function () {
	"use strict";

	var DefaultConfig = {
		"context": "sap.card",
		"properties" : {
			"headerType": {
				"tags": ["header"],
				"label": "{i18n>CARD_EDITOR.HEADERTYPE}",
				"path": "header/type",
				"type": "enum",
				"enum": [
					"Default",
					'Numeric'
				],
				"defaultValue": "Default"
			},
			"title": {
				"tags": ["header"],
				"label": "{i18n>CARD_EDITOR.TITLE}",
				"type": "string",
				"path": "header/title"
			},
			"subTitle": {
				"tags": ["header"],
				"label": "{i18n>CARD_EDITOR.SUBTITLE}",
				"type": "string",
				"path": "header/subTitle"
			},

			// Default header type only
			"icon": {
				"tags": ["header defaultHeader"],
				"label": "{i18n>CARD_EDITOR.ICON}",
				"type": "icon",
				"path": "header/icon/src",
				"visible": "{= ${context>/header/type} !== 'Numeric' }"
			},
			"statusText": {
				"tags": ["header defaultHeader"],
				"label": "{i18n>CARD_EDITOR.STATUS}",
				"type": "string",
				"path": "header/status/text",
				"visible": "{= ${context>/header/type} !== 'Numeric' }"
			},

			// Numeric header type only
			"unitOfMeasurement": {
				"tags": ["header numericHeader"],
				"label": "{i18n>CARD_EDITOR.UOM}",
				"type": "string",
				"path": "header/unitOfMeasurement",
				"visible": "{= ${context>/header/type} === 'Numeric' }"
			},
			"mainIndicatorNumber": {
				"tags": ["header numericHeader mainIndicator"],
				"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.NUMBER}",
				"type": "string",
				"path": "header/mainIndicator/number",
				"visible": "{= ${context>/header/type} === 'Numeric' }"
			},
			"mainIndicatorUnit": {
				"tags": ["header numericHeader mainIndicator"],
				"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.UNIT}",
				"type": "string",
				"path": "header/mainIndicator/unit",
				"visible": "{= ${context>/header/type} === 'Numeric' }"
			},
			"mainIndicatorTrend": {
				"tags": ["header numericHeader mainIndicator"],
				"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.TREND}",
				"type": "enum",
				"enum": [
					"Down",
					"None",
					"Up"
				],
				"allowBinding": true,
				"path": "header/mainIndicator/trend",
				"visible": "{= ${context>/header/type} === 'Numeric' }"
			},
			"mainIndicatorState": {
				"tags": ["header numericHeader mainIndicator"],
				"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.STATE}",
				"type": "enum",
				"enum": [
					"Critical",
					"Error",
					"Good",
					"Neutral"
				],
				"allowBinding": true,
				"path": "header/mainIndicator/state",
				"visible": "{= ${context>/header/type} === 'Numeric' }"
			},
			"details": {
				"tags": ["header numericHeader"],
				"label": "{i18n>CARD_EDITOR.DETAILS}",
				"type": "string",
				"path": "header/details",
				"visible": "{= ${context>/header/type} === 'Numeric' }"
			},

			"sideIndicators" : {
				"tags": ["header numericHeader"],
				"label": "{i18n>CARD_EDITOR.SIDE_INDICATORS}",
				"path": "header/sideIndicators",
				"type": "array",
				"itemLabel": "{i18n>CARD_EDITOR.SIDE_INDICATOR}",
				"template": {
					"title" : {
						"label": "{i18n>CARD_EDITOR.SIDE_INDICATOR.TITLE}",
						"type": "string",
						"path": "header/sideIndicators/:index/title"
					},
					"number" : {
						"label": "{i18n>CARD_EDITOR.SIDE_INDICATOR.NUMBER}",
						"type": "string",
						"path": "header/sideIndicators/:index/number"
					},
					"unit" : {
						"label": "{i18n>CARD_EDITOR.SIDE_INDICATOR.UNIT}",
						"type": "string",
						"path": "header/sideIndicators/:index/unit"
					}
				},
				"maxItems": 2,
				"visible": "{= ${context>/header/type} === 'Numeric' }"
			},

			// List Card Item
			"listItemTitle": {
				"tags": ["content listItem"],
				"label": "{i18n>CARD_EDITOR.LIST_ITEM.TITLE}",
				"type": "string",
				"path": "content/item/title",
				"visible": "{= ${context>/type} === 'List' }"
			},
			"listItemDescription" : {
				"tags": ["content listItem"],
				"label": "{i18n>CARD_EDITOR.LIST_ITEM.DESCRIPTION}",
				"type": "string",
				"path": "content/item/description",
				"visible": "{= ${context>/type} === 'List' }"
			},
			"listItemHighlight": {
				"tags": ["content listItem"],
				"label": "{i18n>CARD_EDITOR.LIST_ITEM.HIGHLIGHT}",
				"type": "string",
				"path": "content/item/highlight",
				"visible": "{= ${context>/type} === 'List' }"
			},
			"parameters": {
				"tags": ["parameters"],
				"label": "{i18n>CARD_EDITOR.PARAMETERS}",
				"path": "configuration/parameters",
				"type": "parameters"
			}
		},
		"propertyEditors": {
			"enum" : "sap/ui/integration/designtime/controls/propertyEditors/EnumStringEditor",
			"string" : "sap/ui/integration/designtime/controls/propertyEditors/StringEditor",
			"icon" : "sap/ui/integration/designtime/controls/propertyEditors/IconEditor",
			"array" : "sap/ui/integration/designtime/controls/propertyEditors/ArrayEditor",
			"parameters" : "sap/ui/integration/designtime/controls/propertyEditors/ParametersEditor"
		},
		"i18n" : "sap/ui/integration/designtime/controls/i18n/i18n.properties"
	};

	return DefaultConfig;
}, /* bExport= */ true);
