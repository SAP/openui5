sap.ui.define(["exports", "../locale/getLocale", "../locale/languageChange", "../locale/normalizeLocale", "../locale/nextFallbackLocale", "../generated/AssetParameters", "../config/Language"], function (_exports, _getLocale, _languageChange, _normalizeLocale, _nextFallbackLocale, _AssetParameters, _Language) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerI18nLoader = _exports.getI18nBundleData = _exports.fetchI18nBundle = void 0;
  _getLocale = _interopRequireDefault(_getLocale);
  _normalizeLocale = _interopRequireDefault(_normalizeLocale);
  _nextFallbackLocale = _interopRequireDefault(_nextFallbackLocale);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // contains package names for which the warning has been shown
  const warningShown = new Set();
  const reportedErrors = new Set();
  const bundleData = new Map();
  const bundlePromises = new Map();
  const loaders = new Map();
  /**
   * Registers i18n loader function for given package and locale.
   *
   * @public
   * @param {string} packageName for which package this loader can fetch data
   * @param {string} localeId locale that this loader can handle
   * @param {function} loader async function that will be passed a localeId and should return a JSON object
   */
  const registerI18nLoader = (packageName, localeId, loader) => {
    // register loader by key
    const bundleKey = `${packageName}/${localeId}`;
    loaders.set(bundleKey, loader);
  };
  _exports.registerI18nLoader = registerI18nLoader;
  const _setI18nBundleData = (packageName, data) => {
    bundleData.set(packageName, data);
  };
  const getI18nBundleData = packageName => {
    return bundleData.get(packageName);
  };
  _exports.getI18nBundleData = getI18nBundleData;
  const _hasLoader = (packageName, localeId) => {
    const bundleKey = `${packageName}/${localeId}`;
    return loaders.has(bundleKey);
  };
  // load bundle over the network once
  const _loadMessageBundleOnce = (packageName, localeId) => {
    const bundleKey = `${packageName}/${localeId}`;
    const loadMessageBundle = loaders.get(bundleKey);
    if (loadMessageBundle && !bundlePromises.get(bundleKey)) {
      bundlePromises.set(bundleKey, loadMessageBundle(localeId));
    }
    return bundlePromises.get(bundleKey); // Investigate if i18n loader exists and this won't return undefined.
  };

  const _showAssetsWarningOnce = packageName => {
    if (!warningShown.has(packageName)) {
      console.warn(`[${packageName}]: Message bundle assets are not configured. Falling back to English texts.`, /* eslint-disable-line */` Add \`import "${packageName}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`); /* eslint-disable-line */
      warningShown.add(packageName);
    }
  };
  const useFallbackBundle = (packageName, localeId) => {
    return localeId !== _AssetParameters.DEFAULT_LANGUAGE && !_hasLoader(packageName, localeId);
  };
  /**
   * This method preforms the asynchronous task of fetching the actual text resources. It will fetch
   * each text resource over the network once (even for multiple calls to the same method).
   * It should be fully finished before the i18nBundle class is created in the webcomponents.
   * This method uses the bundle URLs that are populated by the <code>registerI18nBundle</code> method.
   * To simplify the usage, the synchronization of both methods happens internally for the same <code>bundleId</code>
   * @param {packageName} packageName the NPM package name
   * @public
   */
  const fetchI18nBundle = async packageName => {
    const language = (0, _getLocale.default)().getLanguage();
    const region = (0, _getLocale.default)().getRegion();
    let localeId = language + (region ? `-${region}` : ``);
    if (useFallbackBundle(packageName, localeId)) {
      localeId = (0, _normalizeLocale.default)(localeId);
      while (useFallbackBundle(packageName, localeId)) {
        localeId = (0, _nextFallbackLocale.default)(localeId);
      }
    }
    // use default language unless configured to always fetch it from the network
    const fetchDefaultLanguage = (0, _Language.getFetchDefaultLanguage)();
    if (localeId === _AssetParameters.DEFAULT_LANGUAGE && !fetchDefaultLanguage) {
      _setI18nBundleData(packageName, null); // reset for the default language (if data was set for a previous language)
      return;
    }
    if (!_hasLoader(packageName, localeId)) {
      _showAssetsWarningOnce(packageName);
      return;
    }
    try {
      const data = await _loadMessageBundleOnce(packageName, localeId);
      _setI18nBundleData(packageName, data);
    } catch (error) {
      const e = error;
      if (!reportedErrors.has(e.message)) {
        reportedErrors.add(e.message);
        console.error(e.message); /* eslint-disable-line */
      }
    }
  };
  // When the language changes dynamically (the user calls setLanguage), re-fetch all previously fetched bundles
  _exports.fetchI18nBundle = fetchI18nBundle;
  (0, _languageChange.attachLanguageChange)((lang /* eslint-disable-line */) => {
    const allPackages = [...bundleData.keys()];
    return Promise.all(allPackages.map(fetchI18nBundle));
  });
});