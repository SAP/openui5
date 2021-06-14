sap.ui.define(['sap/ui/core/LocaleData'], function (LocaleData) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var LocaleData__default = /*#__PURE__*/_interopDefaultLegacy(LocaleData);

	const cache = new Map();
	const getCachedLocaleDataInstance = locale => {
		if (!cache.has(locale)) {
			cache.set(locale, LocaleData__default.getInstance(locale));
		}
		return cache.get(locale);
	};

	return getCachedLocaleDataInstance;

});
