sap.ui.define(["exports", "../InitialConfiguration", "../locale/languageChange", "../Render"], function (_exports, _InitialConfiguration, _languageChange, _Render) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setLanguage = _exports.setFetchDefaultLanguage = _exports.getLanguage = _exports.getFetchDefaultLanguage = void 0;
  let language;
  let fetchDefaultLanguage;
  /**
   * Returns the currently configured language, or the browser language as a fallback
   * @returns {String}
   */

  const getLanguage = () => {
    if (language === undefined) {
      language = (0, _InitialConfiguration.getLanguage)();
    }

    return language;
  };
  /**
   * Changes the current language, re-fetches all message bundles, updates all language-aware components
   * and returns a promise that resolves when all rendering is done
   *
   * @param newLanguage
   * @returns {Promise<void>}
   */


  _exports.getLanguage = getLanguage;

  const setLanguage = async newLanguage => {
    if (language === newLanguage) {
      return;
    }

    language = newLanguage;
    await (0, _languageChange.fireLanguageChange)(newLanguage);
    await (0, _Render.reRenderAllUI5Elements)({
      languageAware: true
    });
  };
  /**
   * Defines if the default language, that is inlined, should be
   * fetched over the network instead of using the inlined one.
   * <b>Note:</b> By default the language will not be fetched.
   *
   * @param {Boolean} fetchDefaultLanguage
   */


  _exports.setLanguage = setLanguage;

  const setFetchDefaultLanguage = fetchDefaultLang => {
    fetchDefaultLanguage = fetchDefaultLang;
  };
  /**
   * Returns if the default language, that is inlined, should be fetched over the network.
   * @returns {Boolean}
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