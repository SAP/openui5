sap.ui.define(['../generated/AssetParameters'], function (AssetParameters) { 'use strict';

	const nextFallbackLocale = locale => {
		if (!locale) {
			return AssetParameters.DEFAULT_LOCALE;
		}
		if (locale === "zh_HK") {
			return "zh_TW";
		}
		const p = locale.lastIndexOf("_");
		if (p >= 0) {
			return locale.slice(0, p);
		}
		return locale !== AssetParameters.DEFAULT_LOCALE ? AssetParameters.DEFAULT_LOCALE : "";
	};

	return nextFallbackLocale;

});
