sap.ui.define(["exports", "./asset-registries/i18n", "./asset-registries/LocaleData", "./asset-registries/Themes", "./asset-registries/Icons"], function (_exports, _i18n, _LocaleData, _Themes, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "registerI18nLoader", {
    enumerable: true,
    get: function () {
      return _i18n.registerI18nLoader;
    }
  });
  Object.defineProperty(_exports, "registerIconLoader", {
    enumerable: true,
    get: function () {
      return _Icons.registerIconLoader;
    }
  });
  Object.defineProperty(_exports, "registerLocaleDataLoader", {
    enumerable: true,
    get: function () {
      return _LocaleData.registerLocaleDataLoader;
    }
  });
  Object.defineProperty(_exports, "registerThemePropertiesLoader", {
    enumerable: true,
    get: function () {
      return _Themes.registerThemePropertiesLoader;
    }
  });
});