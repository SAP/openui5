/*!
 * ${copyright}
 *
 * @private
 * @experimental
 */
sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/config/HeaderConfig",
	"sap/ui/integration/designtime/cardEditor/config/ListCardConfig",
	"sap/ui/integration/designtime/cardEditor/config/ObjectCardConfig",
	"sap/ui/integration/designtime/cardEditor/config/TableCardConfig",
	"sap/ui/integration/designtime/cardEditor/config/generateDataConfig"
], function (
	HeaderConfig,
	ListCardConfig,
	ObjectCardConfig,
	TableCardConfig,
	generateDataConfig
) {
	"use strict";

	return {
		"context": "sap.card",
		"properties" : Object.assign(
			{},
			{
				"type": {
					"tags": ["general"],
					"label": "{i18n>CARD_EDITOR.TYPE}",
					"type": "enum",
					"enum": [
						"List",
						"Object",
						"Table"
					],
					"default": "List",
					"path": "type"
				},
				"parameters": {
					"tags": ["general"],
					"label": "{i18n>CARD_EDITOR.PARAMETERS}",
					"path": "configuration/parameters",
					"type": "parameters"
				}
			},
			HeaderConfig,
			ListCardConfig,
			ObjectCardConfig,
			TableCardConfig,
			generateDataConfig(["content"], "content/", "card")
		),
		"propertyEditors": {
			"enum" : "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor",
			"string" : "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
			"icon" : "sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor",
			"array" : "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
			"parameters" : "sap/ui/integration/designtime/baseEditor/propertyEditor/parametersEditor/ParametersEditor",
			"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
			"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
			"json": "sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor",
			"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
		},
		"i18n" : "sap/ui/integration/designtime/cardEditor/i18n/i18n.properties"
	};
});
