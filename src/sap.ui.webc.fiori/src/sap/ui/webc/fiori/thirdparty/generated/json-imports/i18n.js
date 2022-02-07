sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/i18n'], function (require, i18n) { 'use strict';

	const importMessageBundle = async (localeId) => {
			switch (localeId) {
				case "ar": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ar-fca51e46'], resolve, reject) })).default;
			case "bg": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_bg-50ccff83'], resolve, reject) })).default;
			case "ca": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ca-85a06d90'], resolve, reject) })).default;
			case "cs": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cs-302853ec'], resolve, reject) })).default;
			case "cy": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cy-651caccd'], resolve, reject) })).default;
			case "da": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_da-e9aa1ef6'], resolve, reject) })).default;
			case "de": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_de-bb6da518'], resolve, reject) })).default;
			case "el": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_el-615804b9'], resolve, reject) })).default;
			case "en": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en-ef2f3248'], resolve, reject) })).default;
			case "en_GB": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_GB-01c04ea3'], resolve, reject) })).default;
			case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_sappsd-e1269679'], resolve, reject) })).default;
			case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saprigi-489ddf5e'], resolve, reject) })).default;
			case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saptrc-10d21b5e'], resolve, reject) })).default;
			case "es": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es-5f0fedbb'], resolve, reject) })).default;
			case "es_MX": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es_MX-aed7f486'], resolve, reject) })).default;
			case "et": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_et-b3183b9f'], resolve, reject) })).default;
			case "fi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fi-d16defd1'], resolve, reject) })).default;
			case "fr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr-aacafdfd'], resolve, reject) })).default;
			case "fr_CA": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr_CA-85df0db7'], resolve, reject) })).default;
			case "hi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hi-2778913a'], resolve, reject) })).default;
			case "hr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hr-5b970689'], resolve, reject) })).default;
			case "hu": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hu-8420c634'], resolve, reject) })).default;
			case "in": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_in-07afd376'], resolve, reject) })).default;
			case "it": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_it-480eab3a'], resolve, reject) })).default;
			case "iw": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_iw-3985bb6c'], resolve, reject) })).default;
			case "ja": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ja-0ecd14b1'], resolve, reject) })).default;
			case "kk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_kk-7cca1aa0'], resolve, reject) })).default;
			case "ko": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ko-dbbb031f'], resolve, reject) })).default;
			case "lt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lt-89161349'], resolve, reject) })).default;
			case "lv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lv-0fa2a05f'], resolve, reject) })).default;
			case "ms": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ms-f62f8e47'], resolve, reject) })).default;
			case "nl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_nl-51ecab32'], resolve, reject) })).default;
			case "no": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_no-367e49f2'], resolve, reject) })).default;
			case "pl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pl-2dbad320'], resolve, reject) })).default;
			case "pt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt-9607a28c'], resolve, reject) })).default;
			case "pt_PT": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt_PT-9a80b85e'], resolve, reject) })).default;
			case "ro": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ro-81f50071'], resolve, reject) })).default;
			case "ru": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ru-76dc702f'], resolve, reject) })).default;
			case "sh": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sh-ad66acf1'], resolve, reject) })).default;
			case "sk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sk-d8363bca'], resolve, reject) })).default;
			case "sl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sl-dd40d99c'], resolve, reject) })).default;
			case "sv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sv-1eda9721'], resolve, reject) })).default;
			case "th": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_th-8f15355d'], resolve, reject) })).default;
			case "tr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_tr-39a41440'], resolve, reject) })).default;
			case "uk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_uk-2b9e0cc7'], resolve, reject) })).default;
			case "vi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_vi-59c065b0'], resolve, reject) })).default;
			case "zh_CN": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_CN-ee556fa6'], resolve, reject) })).default;
			case "zh_TW": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_TW-acc4d3ac'], resolve, reject) })).default;
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
