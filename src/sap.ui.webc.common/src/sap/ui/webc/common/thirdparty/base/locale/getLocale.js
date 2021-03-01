sap.ui.define(['../util/detectNavigatorLanguage', '../config/Language', './Locale'], function (detectNavigatorLanguage, Language, Locale) { 'use strict';

	const cache = new Map();
	const getLocaleInstance = lang => {
		if (!cache.has(lang)) {
			cache.set(lang, new Locale(lang));
		}
		return cache.get(lang);
	};
	const convertToLocaleOrNull = lang => {
		try {
			if (lang && typeof lang === "string") {
				return getLocaleInstance(lang);
			}
		} catch (e) {
		}
	};
	const getLocale = lang => {
		if (lang) {
			return convertToLocaleOrNull(lang);
		}
		if (Language.getLanguage()) {
			return getLocaleInstance(Language.getLanguage());
		}
		return convertToLocaleOrNull(detectNavigatorLanguage());
	};

	return getLocale;

});
