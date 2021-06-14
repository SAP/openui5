sap.ui.define(['exports', './asset-registries/i18n', './asset-registries/LocaleData', './asset-registries/Themes', './asset-registries/Icons'], function (exports, i18n, LocaleData, Themes, Icons) { 'use strict';



	exports.registerI18nLoader = i18n.registerI18nLoader;
	exports.registerLocaleDataLoader = LocaleData.registerLocaleDataLoader;
	exports.registerThemePropertiesLoader = Themes.registerThemePropertiesLoader;
	exports.registerIconLoader = Icons.registerIconLoader;

	Object.defineProperty(exports, '__esModule', { value: true });

});
