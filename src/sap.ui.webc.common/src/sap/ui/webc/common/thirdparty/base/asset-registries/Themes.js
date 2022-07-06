sap.ui.define(['exports', '../generated/AssetParameters'], function (exports, AssetParameters) { 'use strict';

	const themeStyles = new Map();
	const loaders = new Map();
	const registeredPackages = new Set();
	const registeredThemes = new Set();
	const registerThemeProperties = (_packageName, _themeName, _style) => {
		throw new Error("`registerThemeProperties` has been depracated. Use `registerThemePropertiesLoader` instead.");
	};
	const registerThemePropertiesLoader = (packageName, themeName, loader) => {
		loaders.set(`${packageName}/${themeName}`, loader);
		registeredPackages.add(packageName);
		registeredThemes.add(themeName);
	};
	const getThemeProperties = async (packageName, themeName) => {
		const style = themeStyles.get(`${packageName}_${themeName}`);
		if (style !== undefined) {
			return style;
		}
		if (!registeredThemes.has(themeName)) {
			const regThemesStr = [...registeredThemes.values()].join(", ");
			console.warn(`You have requested a non-registered theme ${themeName} - falling back to ${AssetParameters.DEFAULT_THEME}. Registered themes are: ${regThemesStr}`);
			return _getThemeProperties(packageName, AssetParameters.DEFAULT_THEME);
		}
		return _getThemeProperties(packageName, themeName);
	};
	const _getThemeProperties = async (packageName, themeName) => {
		const loader = loaders.get(`${packageName}/${themeName}`);
		if (!loader) {
			console.error(`Theme [${themeName}] not registered for package [${packageName}]`);
			return;
		}
		let data;
		try {
			data = await loader(themeName);
		} catch (e) {
			console.error(packageName, e.message);
			return;
		}
		const themeProps = data._ || data;
		themeStyles.set(`${packageName}_${themeName}`, themeProps);
		return themeProps;
	};
	const getRegisteredPackages = () => {
		return registeredPackages;
	};
	const isThemeRegistered = theme => {
		return registeredThemes.has(theme);
	};

	exports.getRegisteredPackages = getRegisteredPackages;
	exports.getThemeProperties = getThemeProperties;
	exports.isThemeRegistered = isThemeRegistered;
	exports.registerThemeProperties = registerThemeProperties;
	exports.registerThemePropertiesLoader = registerThemePropertiesLoader;

	Object.defineProperty(exports, '__esModule', { value: true });

});
