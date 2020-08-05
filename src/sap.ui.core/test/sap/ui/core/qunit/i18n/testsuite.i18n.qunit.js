sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/I18N",
		defaults: {
			ui5: {
				language: "en-US"
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {
			"Buddhist": {
				coverage : {
					only : "sap/ui/core/date/Buddhist"
				}
			},
			"Islamic": {
				coverage : {
					only : "sap/ui/core/date/Islamic"
				}
			},
			"Japanese": {
				coverage : {
					only : "sap/ui/core/date/Japanese"
				}
			},
			"Locale": {
				coverage : {
					only : "sap/ui/core/Locale"
				}
			},
			"LocaleData": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				}
			},
			"LocaleData-ar_SA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ar_SA"
				}
			},
			"LocaleData-de_AT": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_AT"
				}
			},
			"LocaleData-de_CH": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_CH"
				}
			},
			"LocaleData-de_DE": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_DE"
				}
			},
			"LocaleData-da_DK": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "da_DK"
				}
			},
			"LocaleData-en_AU": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_AU"
				}
			},
			"LocaleData-en_CA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_CA"
				}
			},
			"LocaleData-en_GB": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_GB"
				}
			},
			"LocaleData-en_US": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_US"
				}
			},
			"LocaleData-en_ZA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "en_ZA"
				}
			},
			"LocaleData-es_MX": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "es_MX"
				}
			},
			"LocaleData-es_ES": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "es_ES"
				}
			},
			"LocaleData-fa_IR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fa_IR"
				}
			},
			"LocaleData-fr_FR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fr_FR"
				}
			},
			"LocaleData-fr_CA": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fr_CA"
				}
			},
			"LocaleData-fr_BE": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "fr_BE"
				}
			},
			"LocaleData-ja_JP": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ja_JP"
				}
			},
			"LocaleData-id_ID": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "id_ID"
				}
			},
			"LocaleData-it_IT": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "it_IT"
				}
			},
			"LocaleData-ru_RU": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ru_RU"
				}
			},
			"LocaleData-pt_BR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "pt_BR"
				}
			},
			"LocaleData-pt_PT": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "pt_PT"
				}
			},
			"LocaleData-hi_IN": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "hi_IN"
				}
			},
			"LocaleData-he_IL": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "he_IL"
				}
			},
			"LocaleData-tr_TR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "tr_TR"
				}
			},
			"LocaleData-nl_BE": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "nl_BE"
				}
			},
			"LocaleData-nl_NL": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "nl_NL"
				}
			},
			"LocaleData-pl_PL": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "pl_PL"
				}
			},
			"LocaleData-ko_KR": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "ko_KR"
				}
			},
			"LocaleData-th_TH": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "th_TH"
				}
			},
			"LocaleData-zh_SG": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "zh_SG"
				}
			},
			"LocaleData-zh_TW": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "zh_TW"
				}
			},
			"LocaleData-zh_CN": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "zh_CN"
				}
			},
			"LocaleData-de_XX": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "de_XX"
				}
			},
			"LocaleData-xx_XX": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false,
				module: "./GenericLocaleData.qunit",
				ui5: {
					language: "xx_XX"
				}
			},

			"Persian": {
				coverage : {
					only : "sap/ui/core/date/Persian"
				}
			},
			"UniversalDate": {
				coverage : {
					only : "sap/ui/core/date/UniversalDate"
				}
			},
			"UniversalDateUtils": {
				title: "sap.ui.core.date.UniversalDateUtils: UniversalDate Utility Functions",
				coverage : {
					only : "sap/ui/core/date/UniversalDateUtils"
				}
			}
		}
	};
});
