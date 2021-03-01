sap.ui.define(['../generated/AssetParameters'], function (AssetParameters) { 'use strict';

	var detectNavigatorLanguage = () => {
		const browserLanguages = navigator.languages;
		const navigatorLanguage = () => {
			return navigator.language;
		};
		const rawLocale = (browserLanguages && browserLanguages[0]) || navigatorLanguage() || navigator.userLanguage || navigator.browserLanguage;
		return rawLocale || AssetParameters.DEFAULT_LANGUAGE;
	};

	return detectNavigatorLanguage;

});
