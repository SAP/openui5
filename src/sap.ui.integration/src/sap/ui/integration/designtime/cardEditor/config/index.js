/*!
 * ${copyright}
 *
 * @private
 * @experimental
 */
sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/config/AppConfig",
	"sap/ui/integration/designtime/cardEditor/config/HeaderConfig",
	"sap/ui/integration/designtime/cardEditor/config/ListCardConfig",
	"sap/ui/integration/designtime/cardEditor/config/ObjectCardConfig",
	"sap/ui/integration/designtime/cardEditor/config/TableCardConfig",
	"sap/ui/integration/designtime/cardEditor/config/generateDataConfig",
	"sap/ui/integration/designtime/cardEditor/config/FooterConfig"

], function (
	AppConfig,
	HeaderConfig,
	ListCardConfig,
	ObjectCardConfig,
	TableCardConfig,
	generateDataConfig,
	FooterConfig
) {
	"use strict";

	return {
		"context": "sap.card",
		"layout": {
			"form": {
				"groups": [
					{
						"label": "{i18n>CARD_EDITOR.GROUP.METADATA}",
						"items": [
							{
								type: "tag",
								value: "app"
							}
						]
					},
					{
						"label": "{i18n>CARD_EDITOR.GROUP.GENERALCONFIGURATION}",
						"items": [
							{
								type: "tag",
								value: "general"
							}
						]
					},
					{
						"label": "{i18n>CARD_EDITOR.GROUP.DATA}",
						"items": [
							{
								type: "propertyName",
								value: "appDataSources"
							},
							{
								type: "tag",
								value: ["data", "general-data"]
							}
						]
					},
					{
						"label": "{i18n>CARD_EDITOR.GROUP.DATAHEADER}",
						"items": [
							{
								type: "tag",
								value: ["data", "header"]
							}
						]
					},
					{
						"label": "{i18n>CARD_EDITOR.GROUP.DATACONTENT}",
						"items": [
							{
								type: "tag",
								value: ["data", "content"]
							}
						]
					},
					{
						"label": "{i18n>CARD_EDITOR.GROUP.HEADER}",
						"items": [
							{
								type: "tag",
								value: "header"
							}
						]
					},
					{
						"label": "{i18n>CARD_EDITOR.GROUP.CONTENT}",
						"items": [
							{
								type: "tag",
								value: "content"
							}
						]
					},
					{
						"label": "{i18n>CARD_EDITOR.GROUP.FOOTER}",
						"items": [
							{
								type: "tag",
								value: "footer"
							}
						]
					}
				]
			}
		},
		"properties": Object.assign(
			{},
			AppConfig,
			{
				"type": {
					"tags": ["general"],
					"label": "{i18n>CARD_EDITOR.TYPE}",
					"type": "select",
					"items": sap.ui.version.includes('SNAPSHOT') && !window.location.host.includes("openui5nightly")
						? [
							{ "key": "List" },
							{ "key": "Analytical" },
							{ "key": "Table" },
							{ "key": "Object" },
							{ "key": "Timeline" },
							{ "key": "Component" },
							{ "key": "Calendar" },
							{ "key": "AdaptiveCard" }
						]
						: [
							{ "key": "List" },
							{ "key": "Table" },
							{ "key": "Object" }
						],
					"path": "type"
				},
				"parameters": {
					"tags": ["general"],
					"label": "{i18n>CARD_EDITOR.PARAMETERS}",
					"addItemLabel": "{i18n>CARD_EDITOR.ADD.PARAMETER}",
					"path": "configuration/parameters",
					"type": "parameters",
					"allowedTypes": ["string", "array", "number", "boolean", "integer", "date", "datetime", "simpleicon", "object", "objectArray", "group", "separator"]
				},
				"destinations": {
					"tags": ["general"],
					"label": "{i18n>CARD_EDITOR.DESTINATIONS}",
					"itemLabel": "{key}",
					"addItemLabel": "{i18n>CARD_EDITOR.DESTINATION}",
					"path": "configuration/destinations",
					"type": "destinations",
					"allowedValues": ["Northwind", "JAM"]
				},
				"filters": {
					"tags": ["general"],
					"label": "{i18n>CARD_EDITOR.FILTERS}",
					"itemLabel": "{key}",
					"addItemLabel": "{i18n>CARD_EDITOR.FILTER}",
					"path": "configuration/filters",
					"type": "filters",
					"allowedTypes": ["Select", "DateRange", "Search"]
				}
			},
			HeaderConfig,
			ListCardConfig,
			ObjectCardConfig,
			TableCardConfig,
			FooterConfig,
			generateDataConfig(["general-data"], "", "card"),
			generateDataConfig(["header"], "header/", "header"),
			generateDataConfig(["content"], "content/", "content")
		),
		"propertyEditors": {
			// base editors:
			"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor",
			"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
			"multiSelect": "sap/ui/integration/designtime/baseEditor/propertyEditor/multiSelectEditor/MultiSelectEditor",
			"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
			"simpleicon": "sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor",
			"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
			"parameters": "sap/ui/integration/designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor",
			"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
			"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
			"integer": "sap/ui/integration/designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor",
			"json": "sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor",
			"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
			"list": "sap/ui/integration/designtime/baseEditor/propertyEditor/listEditor/ListEditor",
			"datetime": "sap/ui/integration/designtime/baseEditor/propertyEditor/dateTimeEditor/DateTimeEditor",
			"date": "sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor",
			"group": "sap/ui/integration/designtime/baseEditor/propertyEditor/groupEditor/GroupEditor",
			"separator": "sap/ui/integration/designtime/baseEditor/propertyEditor/separatorEditor/SeparatorEditor",
			"textArea": "sap/ui/integration/designtime/baseEditor/propertyEditor/textAreaEditor/TextAreaEditor",
			"object": "sap/ui/integration/designtime/baseEditor/propertyEditor/textAreaEditor/TextAreaEditor",
			"objectArray": "sap/ui/integration/designtime/baseEditor/propertyEditor/objectArrayEditor/ObjectArrayEditor",
			// card editors
			"icon": "sap/ui/integration/designtime/cardEditor/propertyEditor/iconEditor/IconEditor",
			"complexMap": "sap/ui/integration/designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor",
			"destinations": "sap/ui/integration/designtime/cardEditor/propertyEditor/destinationsEditor/DestinationsEditor",
			"filters": "sap/ui/integration/designtime/cardEditor/propertyEditor/filtersEditor/FiltersEditor"
		},
		"validators": {
			"patternList": "sap/ui/integration/designtime/cardEditor/validator/IsPatternMatchList"
		},
		"i18n": "sap/ui/integration/designtime/cardEditor/i18n/i18n.properties"
	};
});
