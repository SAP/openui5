sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/i18n'], function (require, i18n) { 'use strict';

	const importMessageBundle = async (localeId) => {
			switch (localeId) {
				case "ar": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ar-44439c97'], resolve, reject) })).default;
			case "bg": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_bg-fdae1bcf'], resolve, reject) })).default;
			case "ca": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ca-7581bd78'], resolve, reject) })).default;
			case "cs": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cs-7b85961f'], resolve, reject) })).default;
			case "cy": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_cy-8a99e49e'], resolve, reject) })).default;
			case "da": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_da-89336083'], resolve, reject) })).default;
			case "de": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_de-3c93537d'], resolve, reject) })).default;
			case "el": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_el-b8e61b39'], resolve, reject) })).default;
			case "en": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en-f820b936'], resolve, reject) })).default;
			case "en_GB": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_GB-2d06b0a2'], resolve, reject) })).default;
			case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_sappsd-5a02ac90'], resolve, reject) })).default;
			case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saprigi-789390fa'], resolve, reject) })).default;
			case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_en_US_saptrc-b8adcdb7'], resolve, reject) })).default;
			case "es": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es-7e74a0d1'], resolve, reject) })).default;
			case "es_MX": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_es_MX-1c8bef3a'], resolve, reject) })).default;
			case "et": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_et-5933b774'], resolve, reject) })).default;
			case "fi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fi-517cc30a'], resolve, reject) })).default;
			case "fr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr-a2392062'], resolve, reject) })).default;
			case "fr_CA": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_fr_CA-f344b9ee'], resolve, reject) })).default;
			case "hi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hi-38018202'], resolve, reject) })).default;
			case "hr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hr-d11d69e6'], resolve, reject) })).default;
			case "hu": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_hu-d821865b'], resolve, reject) })).default;
			case "in": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_in-7ab9b6f2'], resolve, reject) })).default;
			case "it": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_it-4dd2dad6'], resolve, reject) })).default;
			case "iw": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_iw-e949b7aa'], resolve, reject) })).default;
			case "ja": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ja-b64ae516'], resolve, reject) })).default;
			case "kk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_kk-9dac905f'], resolve, reject) })).default;
			case "ko": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ko-10e59793'], resolve, reject) })).default;
			case "lt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lt-e8dc2eb8'], resolve, reject) })).default;
			case "lv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_lv-6badab65'], resolve, reject) })).default;
			case "ms": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ms-f8678163'], resolve, reject) })).default;
			case "nl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_nl-f7a1cfe3'], resolve, reject) })).default;
			case "no": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_no-ce2399a5'], resolve, reject) })).default;
			case "pl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pl-bb65b96d'], resolve, reject) })).default;
			case "pt": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt-1f8c4439'], resolve, reject) })).default;
			case "pt_PT": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_pt_PT-499d1394'], resolve, reject) })).default;
			case "ro": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ro-99e5bd12'], resolve, reject) })).default;
			case "ru": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_ru-9f279958'], resolve, reject) })).default;
			case "sh": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sh-ce784ebe'], resolve, reject) })).default;
			case "sk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sk-0912b583'], resolve, reject) })).default;
			case "sl": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sl-5958b1c6'], resolve, reject) })).default;
			case "sv": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_sv-2f383035'], resolve, reject) })).default;
			case "th": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_th-165667bf'], resolve, reject) })).default;
			case "tr": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_tr-4ba1e580'], resolve, reject) })).default;
			case "uk": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_uk-7e676f92'], resolve, reject) })).default;
			case "vi": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_vi-885b221b'], resolve, reject) })).default;
			case "zh_CN": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_CN-749d6f29'], resolve, reject) })).default;
			case "zh_TW": return (await new Promise(function (resolve, reject) { require(['../../messagebundle_zh_TW-e2d9f940'], resolve, reject) })).default;
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
			i18n.registerI18nLoader("@ui5/webcomponents", localeId, importAndCheck);
		});

});
