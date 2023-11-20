sap.ui.define(["exports", "../locale/languageChange", "../locale/getLocale", "../generated/AssetParameters", "../FeaturesRegistry"], function (_exports, _languageChange, _getLocale, _AssetParameters, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerLocaleDataLoader = _exports.getLocaleData = _exports.fetchCldr = void 0;
  _getLocale = _interopRequireDefault(_getLocale);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const localeDataMap = new Map();
  const loaders = new Map();
  const cldrPromises = new Map();
  const reportedErrors = new Set();
  let warningShown = false;
  const M_ISO639_OLD_TO_NEW = {
    "iw": "he",
    "ji": "yi",
    "in": "id"
  };
  const _showAssetsWarningOnce = localeId => {
    if (warningShown) {
      return;
    }
    console.warn(`[LocaleData] Supported locale "${localeId}" not configured, import the "Assets.js" module from the webcomponents package you are using.`); /* eslint-disable-line */
    warningShown = true;
  };
  const calcLocale = (language, region, script) => {
    // normalize language and handle special cases
    language = language && M_ISO639_OLD_TO_NEW[language] || language;
    // Special case 1: in an SAP context, the inclusive language code "no" always means Norwegian Bokmal ("nb")
    if (language === "no") {
      language = "nb";
    }
    // Special case 2: for Chinese, derive a default region from the script (this behavior is inherited from Java)
    if (language === "zh" && !region) {
      if (script === "Hans") {
        region = "CN";
      } else if (script === "Hant") {
        region = "TW";
      }
    }
    // Special case 3: for Serbian, there are cyrillic and latin scripts, "sh" and "sr-latn" map to "latin", "sr" maps to cyrillic.
    if (language === "sh" || language === "sr" && script === "Latn") {
      language = "sr";
      region = "Latn";
    }
    // try language + region
    let localeId = `${language}_${region}`;
    if (_AssetParameters.SUPPORTED_LOCALES.includes(localeId)) {
      if (loaders.has(localeId)) {
        // supported and has loader
        return localeId;
      }
      // supported, no loader - fallback to default and warn
      _showAssetsWarningOnce(localeId);
      return _AssetParameters.DEFAULT_LOCALE;
    }
    // not supported, try language only
    localeId = language;
    if (_AssetParameters.SUPPORTED_LOCALES.includes(localeId)) {
      if (loaders.has(localeId)) {
        // supported and has loader
        return localeId;
      }
      // supported, no loader - fallback to default and warn
      _showAssetsWarningOnce(localeId);
      return _AssetParameters.DEFAULT_LOCALE;
    }
    // not supported - fallback to default locale
    return _AssetParameters.DEFAULT_LOCALE;
  };
  // internal set data
  const setLocaleData = (localeId, content) => {
    localeDataMap.set(localeId, content);
  };
  // external getSync
  const getLocaleData = localeId => {
    // if there is no loader, the default fallback was fetched and a warning was given - use default locale instead
    if (!loaders.has(localeId)) {
      localeId = _AssetParameters.DEFAULT_LOCALE;
    }
    const content = localeDataMap.get(localeId);
    if (!content) {
      throw new Error(`CLDR data for locale ${localeId} is not loaded!`);
    }
    return content;
  };
  // load bundle over the network once
  _exports.getLocaleData = getLocaleData;
  const _loadCldrOnce = localeId => {
    if (!cldrPromises.get(localeId)) {
      const loadCldr = loaders.get(localeId);
      if (!loadCldr) {
        throw new Error(`CLDR data for locale ${localeId} is not loaded!`);
      }
      cldrPromises.set(localeId, loadCldr(localeId));
    }
    return cldrPromises.get(localeId);
  };
  // external getAsync
  const fetchCldr = async (language, region, script) => {
    const localeId = calcLocale(language, region, script);
    // reuse OpenUI5 CLDR if present
    const openUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");
    if (openUI5Support) {
      const cldrContent = openUI5Support.getLocaleDataObject();
      if (cldrContent) {
        // only if openui5 actually returned valid content
        setLocaleData(localeId, cldrContent);
        return;
      }
    }
    // fetch it
    try {
      const cldrContent = await _loadCldrOnce(localeId);
      setLocaleData(localeId, cldrContent);
    } catch (error) {
      const e = error;
      if (!reportedErrors.has(e.message)) {
        reportedErrors.add(e.message);
        console.error(e.message); /* eslint-disable-line */
      }
    }
  };
  _exports.fetchCldr = fetchCldr;
  const registerLocaleDataLoader = (localeId, loader) => {
    loaders.set(localeId, loader);
  };
  // register default loader for "en" from ui5 CDN (dev workflow without assets)
  _exports.registerLocaleDataLoader = registerLocaleDataLoader;
  registerLocaleDataLoader("en", async () => {
    const cldrContent = await fetch(`https://sdk.openui5.org/1.103.0/resources/sap/ui/core/cldr/en.json`);
    return cldrContent.json();
  });
  // When the language changes dynamically (the user calls setLanguage),
  // re-fetch the required CDRD data.
  (0, _languageChange.attachLanguageChange)(() => {
    const locale = (0, _getLocale.default)();
    return fetchCldr(locale.getLanguage(), locale.getRegion(), locale.getScript());
  });
});