sap.ui.define(['exports', '../InitialConfiguration', '../Render', '../theming/applyTheme'], function (exports, InitialConfiguration, Render, applyTheme) { 'use strict';

	let theme;
	const getTheme = () => {
		if (theme === undefined) {
			theme = InitialConfiguration.getTheme();
		}
		return theme;
	};
	const setTheme = async newTheme => {
		if (theme === newTheme) {
			return;
		}
		theme = newTheme;
		await applyTheme(theme);
		await Render.reRenderAllUI5Elements({ themeAware: true });
	};
	const isTheme = _theme => {
		const currentTheme = getTheme();
		return currentTheme === _theme || currentTheme === `${_theme}_exp`;
	};

	exports.getTheme = getTheme;
	exports.isTheme = isTheme;
	exports.setTheme = setTheme;

	Object.defineProperty(exports, '__esModule', { value: true });

});
