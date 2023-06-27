sap.ui.define(["exports", "../generated/AssetParameters"], function (_exports, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const localeRegEX = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
  const SAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd)(?:-|$)/i;
  /* Map for old language names for a few ISO639 codes. */
  const M_ISO639_NEW_TO_OLD = {
    "he": "iw",
    "yi": "ji",
    "nb": "no",
    "sr": "sh"
  };
  /**
   * Normalizes the given locale in BCP-47 syntax.
   * @param {string} locale locale to normalize
   * @returns {string} Normalized locale, "undefined" if the locale can't be normalized or the default locale, if no locale provided.
   */
  const normalizeLocale = locale => {
    let m;
    if (!locale) {
      return _AssetParameters.DEFAULT_LOCALE;
    }
    if (typeof locale === "string" && (m = localeRegEX.exec(locale.replace(/_/g, "-")))) {
      /* eslint-disable-line */
      let language = m[1].toLowerCase();
      let region = m[3] ? m[3].toUpperCase() : undefined;
      const script = m[2] ? m[2].toLowerCase() : undefined;
      const variants = m[4] ? m[4].slice(1) : undefined;
      const isPrivate = m[6];
      language = M_ISO639_NEW_TO_OLD[language] || language;
      // recognize and convert special SAP supportability locales (overwrites m[]!)
      if (isPrivate && (m = SAPSupportabilityLocales.exec(isPrivate)) /* eslint-disable-line */ || variants && (m = SAPSupportabilityLocales.exec(variants))) {
        /* eslint-disable-line */
        return `en_US_${m[1].toLowerCase()}`; // for now enforce en_US (agreed with SAP SLS)
      }
      // Chinese: when no region but a script is specified, use default region for each script
      if (language === "zh" && !region) {
        if (script === "hans") {
          region = "CN";
        } else if (script === "hant") {
          region = "TW";
        }
      }
      return language + (region ? "_" + region + (variants ? "_" + variants.replace("-", "_") : "") : ""); /* eslint-disable-line */
    }

    return _AssetParameters.DEFAULT_LOCALE;
  };
  var _default = normalizeLocale;
  _exports.default = _default;
});