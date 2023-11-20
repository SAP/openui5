sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.SUPPORTED_THEMES = _exports.SUPPORTED_LOCALES = _exports.DEFAULT_THEME = _exports.DEFAULT_LOCALE = _exports.DEFAULT_LANGUAGE = void 0;
  const assetParameters = {
    "themes": {
      "default": "sap_fiori_3",
      "all": ["sap_fiori_3", "sap_fiori_3_dark", "sap_belize", "sap_belize_hcb", "sap_belize_hcw", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_dark", "sap_horizon_hcb", "sap_horizon_hcw", "sap_horizon_exp", "sap_horizon_dark_exp", "sap_horizon_hcb_exp", "sap_horizon_hcw_exp"]
    },
    "languages": {
      "default": "en",
      "all": ["ar", "bg", "ca", "cs", "cy", "da", "de", "el", "en", "en_GB", "en_US_sappsd", "en_US_saprigi", "en_US_saptrc", "es", "es_MX", "et", "fi", "fr", "fr_CA", "hi", "hr", "hu", "in", "it", "iw", "ja", "kk", "ko", "lt", "lv", "ms", "nl", "no", "pl", "pt_PT", "pt", "ro", "ru", "sh", "sk", "sl", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_TW"]
    },
    "locales": {
      "default": "en",
      "all": ["ar", "ar_EG", "ar_SA", "bg", "ca", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY", "en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es", "es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr", "fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt", "lv", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"]
    }
  };
  const DEFAULT_THEME = assetParameters.themes.default;
  _exports.DEFAULT_THEME = DEFAULT_THEME;
  const SUPPORTED_THEMES = assetParameters.themes.all;
  _exports.SUPPORTED_THEMES = SUPPORTED_THEMES;
  const DEFAULT_LANGUAGE = assetParameters.languages.default;
  _exports.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
  const DEFAULT_LOCALE = assetParameters.locales.default;
  _exports.DEFAULT_LOCALE = DEFAULT_LOCALE;
  const SUPPORTED_LOCALES = assetParameters.locales.all;
  _exports.SUPPORTED_LOCALES = SUPPORTED_LOCALES;
});