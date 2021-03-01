sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/i18n'], function (require, i18n) { 'use strict';

	const importMessageBundle = async (localeId) => {
			switch (localeId) {
				case "ar": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ar-59619ddd'], resolve, reject) })).default;
			case "bg": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_bg-b36e00fa'], resolve, reject) })).default;
			case "ca": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ca-a103fc34'], resolve, reject) })).default;
			case "cs": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cs-d56df98c'], resolve, reject) })).default;
			case "cy": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cy-e28cac51'], resolve, reject) })).default;
			case "da": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_da-7f08bcaa'], resolve, reject) })).default;
			case "de": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_de-a43e24f9'], resolve, reject) })).default;
			case "el": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_el-8b1bd7a2'], resolve, reject) })).default;
			case "en": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en-502be1f9'], resolve, reject) })).default;
			case "en_GB": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_GB-d28c7c2d'], resolve, reject) })).default;
			case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_sappsd-f0f7ff12'], resolve, reject) })).default;
			case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saprigi-f136d08a'], resolve, reject) })).default;
			case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saptrc-ea579165'], resolve, reject) })).default;
			case "es": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es-cf460452'], resolve, reject) })).default;
			case "es_MX": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es_MX-b588b49c'], resolve, reject) })).default;
			case "et": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_et-33a3c1a9'], resolve, reject) })).default;
			case "fi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fi-05999936'], resolve, reject) })).default;
			case "fr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr-6b78c685'], resolve, reject) })).default;
			case "fr_CA": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr_CA-5cd1bb21'], resolve, reject) })).default;
			case "hi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hi-71f54fc7'], resolve, reject) })).default;
			case "hr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hr-1d544b5e'], resolve, reject) })).default;
			case "hu": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hu-d9824d87'], resolve, reject) })).default;
			case "in": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_in-07afd376'], resolve, reject) })).default;
			case "it": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_it-590c03c0'], resolve, reject) })).default;
			case "iw": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_iw-2a4cd300'], resolve, reject) })).default;
			case "ja": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ja-a2be15f9'], resolve, reject) })).default;
			case "kk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_kk-d1344aab'], resolve, reject) })).default;
			case "ko": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ko-0da72c2c'], resolve, reject) })).default;
			case "lt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lt-fe9461f4'], resolve, reject) })).default;
			case "lv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lv-217ab319'], resolve, reject) })).default;
			case "ms": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ms-a35de2b8'], resolve, reject) })).default;
			case "nl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_nl-9be8eb5b'], resolve, reject) })).default;
			case "no": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_no-73f4a816'], resolve, reject) })).default;
			case "pl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pl-c579e301'], resolve, reject) })).default;
			case "pt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt-407551a4'], resolve, reject) })).default;
			case "pt_PT": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt_PT-7d09f65f'], resolve, reject) })).default;
			case "ro": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ro-c9bda608'], resolve, reject) })).default;
			case "ru": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ru-f4dac468'], resolve, reject) })).default;
			case "sh": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sh-c66bf858'], resolve, reject) })).default;
			case "sk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sk-8df875ec'], resolve, reject) })).default;
			case "sl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sl-b18551b8'], resolve, reject) })).default;
			case "sv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sv-7db1ca43'], resolve, reject) })).default;
			case "th": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_th-9445e465'], resolve, reject) })).default;
			case "tr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_tr-b6eee8da'], resolve, reject) })).default;
			case "uk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_uk-6fcd6591'], resolve, reject) })).default;
			case "vi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_vi-db4b5291'], resolve, reject) })).default;
			case "zh_CN": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_CN-6b87b448'], resolve, reject) })).default;
			case "zh_TW": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_TW-8b6411cf'], resolve, reject) })).default;
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
