sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/core/LocaleData'], function (LocaleData, getLocale, LocaleData$1) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var LocaleData__default = /*#__PURE__*/_interopDefaultLegacy(LocaleData$1);

	const instances = new Map();
	const getLocaleData = async lang => {
		const locale = getLocale__default(lang);
		const localeLang = locale.getLanguage();
		if (!instances.has(localeLang)) {
			await LocaleData.fetchCldr(locale.getLanguage(), locale.getRegion(), locale.getScript());
			instances.set(localeLang, LocaleData__default.getInstance(locale));
		}
		return instances.get(localeLang);
	};

	return getLocaleData;

});
