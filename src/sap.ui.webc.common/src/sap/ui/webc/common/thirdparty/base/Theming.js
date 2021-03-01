sap.ui.define(['exports', './theming/CustomStyle', './theming/ThemeLoaded'], function (exports, CustomStyle, ThemeLoaded) { 'use strict';



	exports.addCustomCSS = CustomStyle.addCustomCSS;
	exports.attachThemeLoaded = ThemeLoaded.attachThemeLoaded;
	exports.detachThemeLoaded = ThemeLoaded.detachThemeLoaded;

	Object.defineProperty(exports, '__esModule', { value: true });

});
