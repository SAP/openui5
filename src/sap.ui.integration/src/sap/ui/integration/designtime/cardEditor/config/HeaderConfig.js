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
		"headerType": {
			"tags": ["header"],
			"label": "{i18n>CARD_EDITOR.HEADERTYPE}",
			"path": "header/type",
			"type": "select",
			"items": [
				{
					"key": "Default",
					"title": "{i18n>CARD_EDITOR.HEADERTYPE.DEFAULT}"
				},
				{
					"key": "Numeric",
					"title": "{i18n>CARD_EDITOR.HEADERTYPE.NUMERIC}"
				}
			],
			"defaultValue": "Default"
		},
		"headerPosition": {
			"tags": ["header"],
			"label": "{i18n>CARD_EDITOR.HEADERPOSITION}",
			"path": "headerPosition",
			"type": "select",
			"items": [
				{
					"key": "Top",
					"title": "{i18n>CARD_EDITOR.HEADERPOSITION.TOP}"
				},
				{
					"key": "Bottom",
					"title": "{i18n>CARD_EDITOR.HEADERPOSITION.BOTTOM}"
				}
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
		"actions": generateActionConfig({
			"tags": ["header"],
			"path": "header/actions",
			"maxItems": 1
		}),
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
			"path": "header/icon",
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
			"label": "{i18n>CARD_EDITOR.NUMBER}",
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
			"type": "select",
			"items": [
				{
					"key": "Down",
					"title": "{i18n>CARD_EDITOR.MAIN_INDICATOR.TREND.DOWN}"
				},
				{
					"key": "None",
					"title": "{i18n>CARD_EDITOR.MAIN_INDICATOR.TREND.NONE}"
				},
				{
					"key": "Up",
					"title": "{i18n>CARD_EDITOR.MAIN_INDICATOR.TREND.UP}"
				}
			],
			"allowBinding": true,
			"path": "header/mainIndicator/trend",
			"visible": "{= ${context>header/type} === 'Numeric' }"
		},
		"mainIndicatorState": {
			"tags": ["header", "numericHeader", "mainIndicator"],
			"label": "{i18n>CARD_EDITOR.MAIN_INDICATOR.STATE}",
			"type": "select",
			"items": [
				{
					"key": "Critical",
					"title": "{i18n>CARD_EDITOR.MAIN_INDICATOR.STATE.CRITICAL}"
				},
				{
					"key": "Error",
					"title": "{i18n>CARD_EDITOR.MAIN_INDICATOR.STATE.ERROR}"
				},
				{
					"key": "Good",
					"title": "{i18n>CARD_EDITOR.MAIN_INDICATOR.STATE.GOOD}"
				},
				{
					"key": "Neutral",
					"title": "{i18n>CARD_EDITOR.MAIN_INDICATOR.STATE.NEUTRAL}"
				}
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
			"itemLabel": "{title}",
			"addItemLabel": "{i18n>CARD_EDITOR.SIDE_INDICATOR}",
			"template": {
				"title" : {
					"label": "{i18n>CARD_EDITOR.TITLE}",
					"type": "string",
					"path": "title"
				},
				"number" : {
					"label": "{i18n>CARD_EDITOR.NUMBER}",
					"type": "number",
					"path": "number"
				},
				"unit" : {
					"label": "{i18n>CARD_EDITOR.SIDE_INDICATOR.UNIT}",
					"type": "string",
					"path": "unit"
				}
			},
			"maxItems": 2,
			"visible": "{= ${context>header/type} === 'Numeric' }"
		}
	};
});
