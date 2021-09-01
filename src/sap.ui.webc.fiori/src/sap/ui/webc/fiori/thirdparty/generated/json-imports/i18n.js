sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/i18n'], function (require, i18n) { 'use strict';

	const importMessageBundle = async (localeId) => {
			switch (localeId) {
				case "ar": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ar-4986cab5'], resolve, reject) })).default;
			case "bg": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_bg-7e9aa059'], resolve, reject) })).default;
			case "ca": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ca-01451c6a'], resolve, reject) })).default;
			case "cs": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cs-ac6c8738'], resolve, reject) })).default;
			case "cy": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cy-3dfe9dd5'], resolve, reject) })).default;
			case "da": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_da-663276e4'], resolve, reject) })).default;
			case "de": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_de-72e82e46'], resolve, reject) })).default;
			case "el": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_el-c96044ad'], resolve, reject) })).default;
			case "en": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en-2d504d66'], resolve, reject) })).default;
			case "en_GB": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_GB-c8b9808b'], resolve, reject) })).default;
			case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_sappsd-ff0f05eb'], resolve, reject) })).default;
			case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saprigi-9005c49a'], resolve, reject) })).default;
			case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saptrc-e2be9611'], resolve, reject) })).default;
			case "es": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es-20ceffef'], resolve, reject) })).default;
			case "es_MX": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es_MX-9617bbe2'], resolve, reject) })).default;
			case "et": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_et-70cc45fe'], resolve, reject) })).default;
			case "fi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fi-38c6589c'], resolve, reject) })).default;
			case "fr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr-0a9f2183'], resolve, reject) })).default;
			case "fr_CA": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr_CA-5401e307'], resolve, reject) })).default;
			case "hi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hi-9aad7093'], resolve, reject) })).default;
			case "hr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hr-9a46b37c'], resolve, reject) })).default;
			case "hu": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hu-94c5c8ec'], resolve, reject) })).default;
			case "in": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_in-07afd376'], resolve, reject) })).default;
			case "it": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_it-594c952a'], resolve, reject) })).default;
			case "iw": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_iw-3ad5f2eb'], resolve, reject) })).default;
			case "ja": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ja-ec45026f'], resolve, reject) })).default;
			case "kk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_kk-9322e295'], resolve, reject) })).default;
			case "ko": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ko-64bfa5d3'], resolve, reject) })).default;
			case "lt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lt-caf1e289'], resolve, reject) })).default;
			case "lv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lv-8877dca6'], resolve, reject) })).default;
			case "ms": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ms-d3aa34d7'], resolve, reject) })).default;
			case "nl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_nl-7653fecd'], resolve, reject) })).default;
			case "no": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_no-e4cf07cf'], resolve, reject) })).default;
			case "pl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pl-34323862'], resolve, reject) })).default;
			case "pt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt-3c7586ed'], resolve, reject) })).default;
			case "pt_PT": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt_PT-6101090e'], resolve, reject) })).default;
			case "ro": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ro-3e1aac26'], resolve, reject) })).default;
			case "ru": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ru-6fab2afc'], resolve, reject) })).default;
			case "sh": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sh-59c9c475'], resolve, reject) })).default;
			case "sk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sk-3947d2b2'], resolve, reject) })).default;
			case "sl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sl-5cb9b7cc'], resolve, reject) })).default;
			case "sv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sv-9bfc19a7'], resolve, reject) })).default;
			case "th": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_th-a6a77885'], resolve, reject) })).default;
			case "tr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_tr-6f2ec772'], resolve, reject) })).default;
			case "uk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_uk-dde2e605'], resolve, reject) })).default;
			case "vi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_vi-e549a9d4'], resolve, reject) })).default;
			case "zh_CN": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_CN-fa4baf83'], resolve, reject) })).default;
			case "zh_TW": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_TW-060ab1cb'], resolve, reject) })).default;
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
