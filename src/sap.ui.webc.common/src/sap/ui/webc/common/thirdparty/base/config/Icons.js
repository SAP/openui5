sap.ui.define(["exports", "./Theme"], function (_exports, _Theme) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setDefaultIconCollection = _exports.getEffectiveDefaultIconCollection = _exports.getDefaultIconCollection = void 0;
  const IconCollectionConfiguration = new Map();
  /**
   * Sets the default icon collection (v4 or v5) per theme,
   * which will be applied in case icon collection is not specified.
   *
   * Note: by default SAP-icons-v5 is used in SAP Horizon and  SAP-icons-v4 for all the rest.
   * @param {String} theme
   * @param {String} collectionName
   */

  const setDefaultIconCollection = (theme, collectionName) => {
    if (collectionName === "horizon") {
      collectionName = "SAP-icons-v5";
    }

    IconCollectionConfiguration.set(theme, collectionName);
  };
  /**
   * Returns the default icon collection (v4 or v5) for given theme,
   * that is configured.
   *
   * @param {String} theme
   * @returns {String}
   */


  _exports.setDefaultIconCollection = setDefaultIconCollection;

  const getDefaultIconCollection = theme => {
    return IconCollectionConfiguration.get(theme);
  };
  /**
   * Returns the effective icon collection that will be applied for icon web components
   * whenever namespace is not specified.
   * @returns {String}
   */


  _exports.getDefaultIconCollection = getDefaultIconCollection;

  const getEffectiveDefaultIconCollection = () => {
    const currentTheme = (0, _Theme.getTheme)();
    const currentThemeConfiguration = IconCollectionConfiguration.get(currentTheme);

    if (currentThemeConfiguration) {
      return currentThemeConfiguration;
    }

    return (0, _Theme.isThemeFamily)("sap_horizon") ? "SAP-icons-v5" : "SAP-icons";
  };

  _exports.getEffectiveDefaultIconCollection = getEffectiveDefaultIconCollection;
});