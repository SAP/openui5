sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/CORE",
		defaults: {
			ui5: {
				language: "en-US"
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			}
		},
		tests: {
			"Buddhist": {
			},
			"Islamic": {
			},
			"Japanese": {
			},
			"Locale": {
				sinon: false
			},
			"LocaleData": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false
			},
			"Locale-ar_SA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ar_SA"
				},
			},
			"Locale-de_AT": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_AT"
				},
			},
			"Locale-de_CH": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_CH"
				},
			},
			"Locale-de_DE": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_DE"
				},
			},
			"Locale-da_DK": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "da_DK"
				},
			},
			"Locale-en_AU": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_AU"
				},
			},
			"Locale-en_CA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_CA"
				},
			},
			"Locale-en_GB": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_GB"
				},
			},
			"Locale-en_US": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_US"
				},
			},
			"Locale-en_ZA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_ZA"
				},
			},
			"Locale-es_MX": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "es_MX"
				},
			},
			"Locale-es_ES": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "es_ES"
				},
			},
			"Locale-fa_IR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fa_IR"
				},
			},
			"Locale-fr_FR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fr_FR"
				},
			},
			"Locale-fr_CA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fr_CA"
				},
			},
			"Locale-fr_BE": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fr_BE"
				},
			},
			"Locale-ja_JP": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ja_JP"
				},
			},
			"Locale-id_ID": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "id_ID"
				},
			},
			"Locale-it_IT": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "it_IT"
				},
			},
			"Locale-ru_RU": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ru_RU"
				},
			},
			"Locale-pt_BR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "pt_BR"
				},
			},
			"Locale-pt_PT": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "pt_PT"
				},
			},
			"Locale-hi_IN": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "hi_IN"
				},
			},
			"Locale-he_IL": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "he_IL"
				},
			},
			"Locale-tr_TR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "tr_TR"
				},
			},
			"Locale-nl_BE": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "nl_BE"
				},
			},
			"Locale-nl_NL": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "nl_NL"
				},
			},
			"Locale-pl_PL": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "pl_PL"
				},
			},
			"Locale-ko_KR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ko_KR"
				},
			},
			"Locale-th_TH": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "th_TH"
				},
			},
			"Locale-zh_SG": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "zh_SG"
				},
			},
			"Locale-zh_TW": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "zh_TW"
				},
			},
			"Locale-zh_CN": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "zh_CN"
				},
			},
			"Locale-de_XX": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_XX"
				},
			},
			"Locale-xx_XX": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "xx_XX"
				},
			},

			"Persian": {
			},
			"UniversalDate": {
			}
		}
	};
});
