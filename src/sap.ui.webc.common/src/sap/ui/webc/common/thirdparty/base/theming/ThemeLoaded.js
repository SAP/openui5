sap.ui.define(['exports', '../EventProvider'], function (exports, EventProvider) { 'use strict';

	const eventProvider = new EventProvider();
	const THEME_LOADED = "themeLoaded";
	const attachThemeLoaded = listener => {
		eventProvider.attachEvent(THEME_LOADED, listener);
	};
	const detachThemeLoaded = listener => {
		eventProvider.detachEvent(THEME_LOADED, listener);
	};
	const fireThemeLoaded = theme => {
		return eventProvider.fireEvent(THEME_LOADED, theme);
	};

	exports.attachThemeLoaded = attachThemeLoaded;
	exports.detachThemeLoaded = detachThemeLoaded;
	exports.fireThemeLoaded = fireThemeLoaded;

	Object.defineProperty(exports, '__esModule', { value: true });

});
