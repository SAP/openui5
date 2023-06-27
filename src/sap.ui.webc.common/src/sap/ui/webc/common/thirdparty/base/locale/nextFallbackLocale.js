sap.ui.define(["exports", "../generated/AssetParameters"], function (_exports, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Calculates the next fallback locale for the given locale.
   *
   * @param {string} locale Locale string in Java format (underscores) or null
   * @returns {string} Next fallback Locale or "en" if no fallbacks found.
   */
  const nextFallbackLocale = locale => {
    if (!locale) {
      return _AssetParameters.DEFAULT_LOCALE;
    }
    if (locale === "zh_HK") {
      return "zh_TW";
    }
    // if there are multiple segments (separated by underscores), remove the last one
    const p = locale.lastIndexOf("_");
    if (p >= 0) {
      return locale.slice(0, p);
    }
    // for any language but the default, fallback to the default first before falling back to the 'raw' language (empty string)
    return locale !== _AssetParameters.DEFAULT_LOCALE ? _AssetParameters.DEFAULT_LOCALE : "";
  };
  var _default = nextFallbackLocale;
  _exports.default = _default;
});