/*!
 * ${copyright}
 *
 * @constructor
 * @private
 * @experimental
 */
sap.ui.define(function () {
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
					"Numeric"
				],
				"defaultValue": "Default"
			},
			"headerPosition": {
				"tags": ["header"],
				"label": "{i18n>CARD_EDITOR.HEADERPOSITION}",
				"path": "headerPosition",
				"type": "enum",
				"enum": [
					"Top",
					"Bottom"
				],
				"defaultValue": "Top"
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
			"actions": {
				"tags": ["header"],
				"label": "{i18n>CARD_EDITOR.ACTIONS}",
				"type": "array",
				"path": "header/actions",
				"itemLabel": "{i18n>CARD_EDITOR.ACTION}",
				"template": {
					"enabled": {
						"label": "{i18n>CARD_EDITOR.ACTION.ENABLED}",
						"type": "boolean",
						"defaultValue": true,
						"path": "header/actions/:index/enabled"
					},
					"type": {
						"label": "{i18n>CARD_EDITOR.ACTION.TYPE}",
						"type": "enum",
						"enum": ["Navigation"],
						"defaultValue": "Navigation",
						"path": "header/actions/:index/type",
						"visible": false // Deactivated as Navigation is currently the only option
					},
					"service": {
						"label": "{i18n>CARD_EDITOR.ACTION.SERVICE}",
						"type": "string",
						"path": "header/actions/:index/service",
						"visible": false // Currently undocumented
					},
					// "parameters": {
					// 	"label": "{i18n>CARD_EDITOR.ACTION.PARAMETERS}",
					// 	"type": "parameters",
					// 	"path": "header/actions/:index/parameters"
					// },
					"target": {
						"label": "{i18n>CARD_EDITOR.ACTION.TARGET}",
						"type": "enum",
						"enum": [
							"_blank",
							"_self"
						],
						"defaultValue": "_blank",
						"path": "header/actions/:index/target"
					},
					"url": {
						"label": "{i18n>CARD_EDITOR.ACTION.URL}",
						"type": "string",
						"path": "header/actions/:index/url"
					}
				}
			},
			"statusText": {
				"tags": ["header", "defaultHeader"],
				"label": "{i18n>CARD_EDITOR.STATUS}",
				"type": "string",
				"path": "header/status/text"
			},

			// Default header type only
			"icon": {
				"tags": ["header", "defaultHeader"],
				"label": "{i18n>CARD_EDITOR.ICON}",
				"type": "icon",
				"path": "header/icon/src",
				"visible": "{= ${context>header/type} !== 'Numeric' }"
			},

			// Numeric header type only
			"unitOfMeasurement": {
				"tags": ["header", "numericHeader"],
				"label": "{i18n>CARD_EDITOR.UOM}",
				"type": "string",
				"path": "header/unitOfMeasurement",
				"visible": "{= ${context>header/type} === 'Numeric' }"
			},
			"mainIndicatorNumber": {
				"tags": ["header", "numericHeader", "mainIndicator"],
				"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.NUMBER}",
				"type": "number",
				"path": "header/mainIndicator/number",
				"visible": "{= ${context>header/type} === 'Numeric' }"
			},
			"mainIndicatorUnit": {
				"tags": ["header", "numericHeader", "mainIndicator"],
				"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.UNIT}",
				"type": "string",
				"path": "header/mainIndicator/unit",
				"visible": "{= ${context>header/type} === 'Numeric' }"
			},
			"mainIndicatorTrend": {
				"tags": ["header", "numericHeader", "mainIndicator"],
				"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.TREND}",
				"type": "enum",
				"enum": [
					"Down",
					"None",
					"Up"
				],
				"allowBinding": true,
				"path": "header/mainIndicator/trend",
				"visible": "{= ${context>header/type} === 'Numeric' }"
			},
			"mainIndicatorState": {
				"tags": ["header", "numericHeader", "mainIndicator"],
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
				"visible": "{= ${context>header/type} === 'Numeric' }"
			},
			"details": {
				"tags": ["header", "numericHeader"],
				"label": "{i18n>CARD_EDITOR.DETAILS}",
				"type": "string",
				"path": "header/details",
				"visible": "{= ${context>header/type} === 'Numeric' }"
			},

			"sideIndicators" : {
				"tags": ["header", "numericHeader"],
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
						"type": "number",
						"path": "header/sideIndicators/:index/number"
					},
					"unit" : {
						"label": "{i18n>CARD_EDITOR.SIDE_INDICATOR.UNIT}",
						"type": "string",
						"path": "header/sideIndicators/:index/unit"
					}
				},
				"maxItems": 2,
				"visible": "{= ${context>header/type} === 'Numeric' }"
			},

			// Cards
			"cardDataRequestUrl": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.URL}",
				"type": "string",
				"path": "content/data/request/url"
			},
			"cardDataRequestMode": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.MODE}",
				"type": "enum",
				"enum": [
					"no-cors",
					"same-origin",
					"cors"
				],
				"defaultValue": "cors",
				"path": "content/data/request/mode",
				"visible": "{= !!${context>content/data/request/url} }"
			},
			"cardDataRequestMethod": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.METHOD}",
				"type": "enum",
				"enum": [
					"GET",
					"POST"
				],
				"defaultValue": "GET",
				"path": "content/data/request/method",
				"visible": "{= !!${context>content/data/request/url} }"
			},
			// "cardDataRequestParameters": {
			// 	"tags": ["content", "data"],
			// 	"label": "{i18n>CARD_EDITOR.DATA.REQUEST.PARAMETERS}",
			// 	"type": "parameters",
			// 	"path": "content/data/request/parameters",
			// 	"visible": "{= !!${context>content/data/request/url} }"
			// },
			// "cardDataRequestHeaders": {
			// 	"tags": ["content", "data"],
			// 	"label": "{i18n>CARD_EDITOR.DATA.REQUEST.HEADERS}",
			// 	"type": "parameters",
			// 	"path": "content/data/request/headers",
			// 	"visible": "{= !!${context>content/data/request/url} }"
			// },
			"cardDataRequestWithCredentials": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.WITHCREDENTIALS}",
				"type": "boolean",
				"defaultValue": false,
				"path": "content/data/request/withCredentials",
				"visible": "{= !!${context>content/data/request/url} }"
			},
			"cardDataJson": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.JSON}",
				"type": "json",
				"path": "content/data/json"
			},
			"cardDataPath": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.PATH}",
				"type": "string",
				"path": "content/data/path"
			},
			"cardDataServiceName": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.SERVICE.NAME}",
				"type": "string",
				"path": "content/data/service/name",
				"visible": false // Currently undocumented
			},
			// "cardDataServiceParameters": {
			// 	"tags": ["content", "data"],
			// 	"label": "{i18n>CARD_EDITOR.DATA.SERVICE.PARAMETERS}",
			// 	"type": "parameters",
			// 	"path": "content/data/service/parameters",
			// 	"visible": false // Currently undocumented
			// },
			"cardDataUpdateInterval": {
				"tags": ["content", "data"],
				"label": "{i18n>CARD_EDITOR.DATA.UPDATEINTERVAL}",
				"type": "number",
				"path": "content/data/updateInterval"
			},

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
				"default": "None",
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
			"listItemActions": {
				"tags": ["content", "listItem"],
				"label": "{i18n>CARD_EDITOR.ACTIONS}",
				"type": "array",
				"path": "content/item/action",
				"visible": "{= ${context>type} === 'List' }",
				"itemLabel": "{i18n>CARD_EDITOR.ACTION}",
				"template": {
					"type": {
						"label": "{i18n>CARD_EDITOR.ACTION.TYPE}",
						"type": "enum",
						"enum": ["Navigation"],
						"defaultValue": "Navigation",
						"path": "content/item/actions/:index/type"
					},
					"enabled": {
						"label": "{i18n>CARD_EDITOR.ACTION.ENABLED}",
						"type": "boolean",
						"defaultValue": true,
						"path": "content/item/actions/:index/enabled"
					},
					"service": {
						"label": "{i18n>CARD_EDITOR.ACTION.SERVICE}",
						"type": "string",
						"path": "content/item/actions/:index/service"
					},
					"url": {
						"label": "{i18n>CARD_EDITOR.ACTION.URL}",
						"type": "string",
						"path": "content/item/actions/:index/url"
					},
					// "parameters": {
					// 	"label": "{i18n>CARD_EDITOR.ACTION.PARAMETERS}",
					// 	"type": "parameters",
					// 	"path": "content/item/actions/:index/parameters"
					// },
					"target": {
						"label": "{i18n>CARD_EDITOR.ACTION.TARGET}",
						"type": "string",
						"path": "content/item/actions/:index/target"
					}
				}
			},
			"parameters": {
				"tags": ["parameters"],
				"label": "{i18n>CARD_EDITOR.PARAMETERS}",
				"path": "configuration/parameters",
				"type": "parameters"
			}
		},
		"propertyEditors": {
			"enum" : "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor",
			"string" : "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
			"icon" : "sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor",
			"array" : "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
			"parameters" : "sap/ui/integration/designtime/baseEditor/propertyEditor/parametersEditor/ParametersEditor",
			"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
			"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
			"json": "sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor"
		},
		"i18n" : "sap/ui/integration/designtime/cardEditor/i18n/i18n.properties"
	};

	return DefaultConfig;
}, /* bExport= */ true);
