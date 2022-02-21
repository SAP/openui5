sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/i18n'], function (require, i18n) { 'use strict';

	const importMessageBundle = async (localeId) => {
			switch (localeId) {
				case "ar": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_ar'], resolve, reject) })).default;
			case "bg": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_bg'], resolve, reject) })).default;
			case "ca": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_ca'], resolve, reject) })).default;
			case "cs": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_cs'], resolve, reject) })).default;
			case "cy": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_cy'], resolve, reject) })).default;
			case "da": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_da'], resolve, reject) })).default;
			case "de": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_de'], resolve, reject) })).default;
			case "el": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_el'], resolve, reject) })).default;
			case "en": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_en'], resolve, reject) })).default;
			case "en_GB": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_en_GB'], resolve, reject) })).default;
			case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_en_US_sappsd'], resolve, reject) })).default;
			case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_en_US_saprigi'], resolve, reject) })).default;
			case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_en_US_saptrc'], resolve, reject) })).default;
			case "es": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_es'], resolve, reject) })).default;
			case "es_MX": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_es_MX'], resolve, reject) })).default;
			case "et": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_et'], resolve, reject) })).default;
			case "fi": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_fi'], resolve, reject) })).default;
			case "fr": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_fr'], resolve, reject) })).default;
			case "fr_CA": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_fr_CA'], resolve, reject) })).default;
			case "hi": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_hi'], resolve, reject) })).default;
			case "hr": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_hr'], resolve, reject) })).default;
			case "hu": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_hu'], resolve, reject) })).default;
			case "in": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_in'], resolve, reject) })).default;
			case "it": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_it'], resolve, reject) })).default;
			case "iw": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_iw'], resolve, reject) })).default;
			case "ja": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_ja'], resolve, reject) })).default;
			case "kk": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_kk'], resolve, reject) })).default;
			case "ko": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_ko'], resolve, reject) })).default;
			case "lt": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_lt'], resolve, reject) })).default;
			case "lv": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_lv'], resolve, reject) })).default;
			case "ms": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_ms'], resolve, reject) })).default;
			case "nl": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_nl'], resolve, reject) })).default;
			case "no": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_no'], resolve, reject) })).default;
			case "pl": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_pl'], resolve, reject) })).default;
			case "pt": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_pt'], resolve, reject) })).default;
			case "pt_PT": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_pt_PT'], resolve, reject) })).default;
			case "ro": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_ro'], resolve, reject) })).default;
			case "ru": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_ru'], resolve, reject) })).default;
			case "sh": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_sh'], resolve, reject) })).default;
			case "sk": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_sk'], resolve, reject) })).default;
			case "sl": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_sl'], resolve, reject) })).default;
			case "sv": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_sv'], resolve, reject) })).default;
			case "th": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_th'], resolve, reject) })).default;
			case "tr": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_tr'], resolve, reject) })).default;
			case "uk": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_uk'], resolve, reject) })).default;
			case "vi": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_vi'], resolve, reject) })).default;
			case "zh_CN": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_zh_CN'], resolve, reject) })).default;
			case "zh_TW": return (await new Promise(function (resolve, reject) { require(['../../_chunks/messagebundle_zh_TW'], resolve, reject) })).default;
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
			i18n.registerI18nLoader("@ui5/webcomponents-icons", localeId, importAndCheck);
		});

});
