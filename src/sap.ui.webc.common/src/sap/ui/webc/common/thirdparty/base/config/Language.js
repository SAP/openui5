sap.ui.define(['exports', '../InitialConfiguration', '../locale/languageChange', '../Render'], function (exports, InitialConfiguration, languageChange, Render) { 'use strict';

	let language;
	let fetchDefaultLanguage;
	const getLanguage = () => {
		if (language === undefined) {
			language = InitialConfiguration.getLanguage();
		}
		return language;
	};
	const setLanguage = async newLanguage => {
		if (language === newLanguage) {
			return;
		}
		language = newLanguage;
		await languageChange.fireLanguageChange(newLanguage);
		await Render.reRenderAllUI5Elements({ languageAware: true });
	};
	const setFetchDefaultLanguage = fetchDefaultLang => {
		fetchDefaultLanguage = fetchDefaultLang;
	};
	const getFetchDefaultLanguage = () => {
		if (fetchDefaultLanguage === undefined) {
			setFetchDefaultLanguage(InitialConfiguration.getFetchDefaultLanguage());
		}
		return fetchDefaultLanguage;
	};

	exports.getFetchDefaultLanguage = getFetchDefaultLanguage;
	exports.getLanguage = getLanguage;
	exports.setFetchDefaultLanguage = setFetchDefaultLanguage;
	exports.setLanguage = setLanguage;

	Object.defineProperty(exports, '__esModule', { value: true });

});
