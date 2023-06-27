sap.ui.define(["exports", "../InitialConfiguration", "../locale/languageChange", "../Render", "../generated/AssetParameters"], function (_exports, _InitialConfiguration, _languageChange, _Render, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setLanguage = _exports.setFetchDefaultLanguage = _exports.getLanguage = _exports.getFetchDefaultLanguage = _exports.getDefaultLanguage = void 0;
  let curLanguage;
  let fetchDefaultLanguage;
  /**
   * Returns the currently configured language, or the browser language as a fallback.
   * @public
   * @returns {string}
   */
  const getLanguage = () => {
    if (curLanguage === undefined) {
      curLanguage = (0, _InitialConfiguration.getLanguage)();
    }
    return curLanguage;
  };
  /**
   * Changes the current language, re-fetches all message bundles, updates all language-aware components
   * and returns a promise that resolves when all rendering is done.
   *
   * @param {string} language
   * @public
   * @returns {Promise<void>}
   */
  _exports.getLanguage = getLanguage;
  const setLanguage = async language => {
    if (curLanguage === language) {
      return;
    }
    curLanguage = language;
    await (0, _languageChange.fireLanguageChange)(language);
    await (0, _Render.reRenderAllUI5Elements)({
      languageAware: true
    });
  };
  /**
   * Returns the default languague.
   *
   * Note: Default language might be different than the configurated one.
   *
   * @public
   * @returns {string}
   */
  _exports.setLanguage = setLanguage;
  const getDefaultLanguage = () => {
    return _AssetParameters.DEFAULT_LANGUAGE;
  };
  /**
   * Defines if the default language, that is inlined, should be
   * fetched over the network instead of using the inlined one.
   * <b>Note:</b> By default the language will not be fetched.
   *
   * @public
   * @param {boolean} fetchDefaultLang
   */
  _exports.getDefaultLanguage = getDefaultLanguage;
  const setFetchDefaultLanguage = fetchDefaultLang => {
    fetchDefaultLanguage = fetchDefaultLang;
  };
  /**
   * Returns if the default language, that is inlined, should be fetched over the network.
   * @public
   * @returns {boolean}
   */
  _exports.setFetchDefaultLanguage = setFetchDefaultLanguage;
  const getFetchDefaultLanguage = () => {
    if (fetchDefaultLanguage === undefined) {
      setFetchDefaultLanguage((0, _InitialConfiguration.getFetchDefaultLanguage)());
    }
    return fetchDefaultLanguage;
  };
  _exports.getFetchDefaultLanguage = getFetchDefaultLanguage;
});