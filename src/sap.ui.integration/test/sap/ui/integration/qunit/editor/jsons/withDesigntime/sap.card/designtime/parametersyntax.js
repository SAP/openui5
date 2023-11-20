sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"allowDynamicValues": true,
						"translatable": true
					},
					"stringWithTranslatedValue": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValue/value",
						"type": "string",
						"label": "String with translated value"
					},
					"stringWithTranslatedValueIni18nFormat": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValueIni18nFormat/value",
						"type": "string",
						"label": "String with translated value in i18n format"
					},
					"parameterSyntaxNormal": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxNormal/value",
						"type": "string",
						"label": "Normal parameter value with parameter syntax",
						"translatable": true
					},
					"parameterSyntaxToTranslate": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToTranslate/value",
						"type": "string",
						"label": "Parameter value with parameter syntax to translate parameter",
						"translatable": true
					},
					"parameterSyntaxToI18nTranslate": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToI18nTranslate/value",
						"type": "string",
						"label": "Parameter value with parameter syntax to translate parameter in i18n format",
						"translatable": true
					},
					"parameterSyntaxToTODAY_ISO": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToTODAY_ISO/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.TODAY_ISO",
						"translatable": true
					},
					"parameterSyntaxToNOW_ISO": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToNOW_ISO/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.NOW_ISO",
						"translatable": true
					},
					"parameterSyntaxToLOCALE": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToLOCALE/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.LOCALE",
						"translatable": true
					},
					"parameterSyntax_mixed": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntax_mixed/value",
						"type": "string",
						"label": "Parameter value with mixed parameter syntaxs",
						"translatable": true
					},
					"parameterSyntaxToTODAY_ISO1": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToTODAY_ISO1/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.TODAY_ISO1",
						"translatable": true
					},
					"parameterSyntaxToNOW_ISO1": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToNOW_ISO1/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.NOW_ISO1",
						"translatable": true
					},
					"parameterSyntaxToLOCALE1": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToLOCALE1/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.LOCALE1",
						"translatable": true
					},
					"TODAY_ISO2": {
						"manifestpath": "/sap.card/configuration/parameters/TODAY_ISO2/value",
						"type": "string",
						"label": "Parameter TODAY_ISO2",
						"translatable": true
					},
					"parameterSyntaxToTODAY_ISO2": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToTODAY_ISO2/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.TODAY_ISO2",
						"translatable": true
					},
					"NOW_ISO2": {
						"manifestpath": "/sap.card/configuration/parameters/NOW_ISO2/value",
						"type": "string",
						"label": "Parameter NOW_ISO2",
						"translatable": true
					},
					"parameterSyntaxToNOW_ISO2": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToNOW_ISO2/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.NOW_ISO2",
						"translatable": true
					},
					"LOCALE2": {
						"manifestpath": "/sap.card/configuration/parameters/LOCALE2/value",
						"type": "string",
						"label": "Parameter LOCALE2",
						"translatable": true
					},
					"parameterSyntaxToLOCALE2": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxToLOCALE2/value",
						"type": "string",
						"label": "Parameter value with parameter syntax parameter.LOCALE2",
						"translatable": true
					}
				}
			}
		});
	};
});
