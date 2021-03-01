sap.ui.define(['exports', '../InitialConfiguration', '../theming/applyTheme'], function (exports, InitialConfiguration, applyTheme) { 'use strict';

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
	};

	exports.getTheme = getTheme;
	exports.setTheme = setTheme;

	Object.defineProperty(exports, '__esModule', { value: true });

});
