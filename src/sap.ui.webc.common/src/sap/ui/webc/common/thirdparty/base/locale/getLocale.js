sap.ui.define(["exports", "../util/detectNavigatorLanguage", "../config/Language", "./Locale", "../generated/AssetParameters"], function (_exports, _detectNavigatorLanguage, _Language, _Locale, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detectNavigatorLanguage = _interopRequireDefault(_detectNavigatorLanguage);
  _Locale = _interopRequireDefault(_Locale);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const cache = new Map();
  const getLocaleInstance = lang => {
    if (!cache.has(lang)) {
      cache.set(lang, new _Locale.default(lang));
    }
    return cache.get(lang);
  };
  const convertToLocaleOrNull = lang => {
    try {
      if (lang && typeof lang === "string") {
        return getLocaleInstance(lang);
      }
    } catch (e) {
      // ignore
    }
    return new _Locale.default(_AssetParameters.DEFAULT_LOCALE);
  };
  /**
   * Returns the locale based on the parameter or configured language Configuration#getLanguage
   * If no language has been configured - a new locale based on browser language is returned
   */
  const getLocale = lang => {
    if (lang) {
      return convertToLocaleOrNull(lang);
    }
    const configLanguage = (0, _Language.getLanguage)();
    if (configLanguage) {
      return getLocaleInstance(configLanguage);
    }
    return convertToLocaleOrNull((0, _detectNavigatorLanguage.default)());
  };
  var _default = getLocale;
  _exports.default = _default;
});