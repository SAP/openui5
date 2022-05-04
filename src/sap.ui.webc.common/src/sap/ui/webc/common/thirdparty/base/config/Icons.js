sap.ui.define(['exports', './Theme'], function (exports, Theme) { 'use strict';

	const IconCollectionConfiguration = new Map();
	const setDefaultIconCollection = (theme, collectionName) => {
		if (collectionName === "horizon") {
			collectionName = "SAP-icons-v5";
		}
		IconCollectionConfiguration.set(theme, collectionName);
	};
	const getDefaultIconCollection = theme => {
		return IconCollectionConfiguration.get(theme);
	};
	const getEffectiveDefaultIconCollection = () => {
		const currentTheme = Theme.getTheme();
		const currentThemeConfiguration = IconCollectionConfiguration.get(currentTheme);
		if (currentThemeConfiguration) {
			return currentThemeConfiguration;
		}
		return Theme.isThemeFamily("sap_horizon") ? "SAP-icons-v5" : "SAP-icons";
	};

	exports.getDefaultIconCollection = getDefaultIconCollection;
	exports.getEffectiveDefaultIconCollection = getEffectiveDefaultIconCollection;
	exports.setDefaultIconCollection = setDefaultIconCollection;

	Object.defineProperty(exports, '__esModule', { value: true });

});
