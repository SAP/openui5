sap.ui.define(['../generated/AssetParameters'], function (AssetParameters) { 'use strict';

	const localeRegEX = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
	const SAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd)(?:-|$)/i;
	const M_ISO639_NEW_TO_OLD = {
		"he": "iw",
		"yi": "ji",
		"id": "in",
		"sr": "sh",
	};
	const normalizeLocale = locale => {
		let m;
		if (!locale) {
			return AssetParameters.DEFAULT_LOCALE;
		}
		if (typeof locale === "string" && (m = localeRegEX.exec(locale.replace(/_/g, "-")))) {
			let language = m[1].toLowerCase();
			let region = m[3] ? m[3].toUpperCase() : undefined;
			const script = m[2] ? m[2].toLowerCase() : undefined;
			const variants = m[4] ? m[4].slice(1) : undefined;
			const isPrivate = m[6];
			language = M_ISO639_NEW_TO_OLD[language] || language;
			if ((isPrivate && (m = SAPSupportabilityLocales.exec(isPrivate)))  ||
				(variants && (m = SAPSupportabilityLocales.exec(variants)))) {
				return `en_US_${m[1].toLowerCase()}`;
			}
			if (language === "zh" && !region) {
				if (script === "hans") {
					region = "CN";
				} else if (script === "hant") {
					region = "TW";
				}
			}
			return language + (region ? "_" + region + (variants ? "_" + variants.replace("-", "_") : "") : "");
		}
	};

	return normalizeLocale;

});
