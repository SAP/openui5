sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/i18n'], function (require, i18n) { 'use strict';

	const importMessageBundle = async (localeId) => {
			switch (localeId) {
				case "ar": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ar-6c30eb3a'], resolve, reject) })).default;
			case "bg": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_bg-eadd07ba'], resolve, reject) })).default;
			case "ca": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ca-aa64509c'], resolve, reject) })).default;
			case "cs": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cs-32c16549'], resolve, reject) })).default;
			case "cy": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cy-e702162c'], resolve, reject) })).default;
			case "da": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_da-b5a80050'], resolve, reject) })).default;
			case "de": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_de-831f7d4c'], resolve, reject) })).default;
			case "el": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_el-b01bf721'], resolve, reject) })).default;
			case "en": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en-3053835d'], resolve, reject) })).default;
			case "en_GB": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_GB-1e5ad057'], resolve, reject) })).default;
			case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_sappsd-e1269679'], resolve, reject) })).default;
			case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saprigi-489ddf5e'], resolve, reject) })).default;
			case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saptrc-10d21b5e'], resolve, reject) })).default;
			case "es": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es-dfc793a0'], resolve, reject) })).default;
			case "es_MX": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es_MX-728ff015'], resolve, reject) })).default;
			case "et": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_et-4f58a12e'], resolve, reject) })).default;
			case "fi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fi-c0f0906d'], resolve, reject) })).default;
			case "fr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr-920724dc'], resolve, reject) })).default;
			case "fr_CA": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr_CA-43d667a7'], resolve, reject) })).default;
			case "hi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hi-9fcb0f38'], resolve, reject) })).default;
			case "hr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hr-4ed29d46'], resolve, reject) })).default;
			case "hu": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hu-9ac05c07'], resolve, reject) })).default;
			case "in": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_in-07afd376'], resolve, reject) })).default;
			case "it": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_it-b50703a0'], resolve, reject) })).default;
			case "iw": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_iw-06e35c78'], resolve, reject) })).default;
			case "ja": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ja-be972ffb'], resolve, reject) })).default;
			case "kk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_kk-0f517b95'], resolve, reject) })).default;
			case "ko": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ko-ba3bbb9a'], resolve, reject) })).default;
			case "lt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lt-17bbcb73'], resolve, reject) })).default;
			case "lv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lv-8d167789'], resolve, reject) })).default;
			case "ms": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ms-f90420a0'], resolve, reject) })).default;
			case "nl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_nl-e39f4619'], resolve, reject) })).default;
			case "no": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_no-abcb0660'], resolve, reject) })).default;
			case "pl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pl-67aaa4f6'], resolve, reject) })).default;
			case "pt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt-214bd69e'], resolve, reject) })).default;
			case "pt_PT": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt_PT-98bfff1a'], resolve, reject) })).default;
			case "ro": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ro-01928072'], resolve, reject) })).default;
			case "ru": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ru-f2f81e27'], resolve, reject) })).default;
			case "sh": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sh-41d4d7b2'], resolve, reject) })).default;
			case "sk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sk-c3fdf2db'], resolve, reject) })).default;
			case "sl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sl-8aa923f8'], resolve, reject) })).default;
			case "sv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sv-b865a184'], resolve, reject) })).default;
			case "th": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_th-b00acafc'], resolve, reject) })).default;
			case "tr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_tr-91db72f7'], resolve, reject) })).default;
			case "uk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_uk-774094b9'], resolve, reject) })).default;
			case "vi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_vi-d4c3fcbb'], resolve, reject) })).default;
			case "zh_CN": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_CN-4bb05f89'], resolve, reject) })).default;
			case "zh_TW": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_TW-8fcf1b61'], resolve, reject) })).default;
				default: throw "unknown locale"
			}
		};
		const importAndCheck = async (localeId) => {
			const data = await importMessageBundle(localeId);
			if (typeof data === "string" && data.endsWith(".json")) {
				throw new Error(`[i18n] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use 'import ".../Assets-static.js"'. Check the "Assets" documentation for more information.`);
			}
			return data;
		};
		const localeIds = ["ar",
		"bg",
		"ca",
		"cs",
		"cy",
		"da",
		"de",
		"el",
		"en",
		"en_GB",
		"en_US_sappsd",
		"en_US_saprigi",
		"en_US_saptrc",
		"es",
		"es_MX",
		"et",
		"fi",
		"fr",
		"fr_CA",
		"hi",
		"hr",
		"hu",
		"in",
		"it",
		"iw",
		"ja",
		"kk",
		"ko",
		"lt",
		"lv",
		"ms",
		"nl",
		"no",
		"pl",
		"pt",
		"pt_PT",
		"ro",
		"ru",
		"sh",
		"sk",
		"sl",
		"sv",
		"th",
		"tr",
		"uk",
		"vi",
		"zh_CN",
		"zh_TW",];
		localeIds.forEach(localeId => {
			i18n.registerI18nLoader("@ui5/webcomponents-fiori", localeId, importAndCheck);
		});

});
