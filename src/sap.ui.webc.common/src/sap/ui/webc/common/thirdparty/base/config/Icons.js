sap.ui.define(["exports", "./Theme", "../assets-meta/IconCollectionsAlias"], function (_exports, _Theme, _IconCollectionsAlias) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setDefaultIconCollection = _exports.getEffectiveIconCollection = _exports.getDefaultIconCollection = _exports.RegisteredIconCollection = void 0;
  const IconCollectionConfiguration = new Map();
  // All registered icon collections - all icon collections resolves to these options at the end
  var RegisteredIconCollection;
  _exports.RegisteredIconCollection = RegisteredIconCollection;
  (function (RegisteredIconCollection) {
    RegisteredIconCollection["SAPIconsV4"] = "SAP-icons-v4";
    RegisteredIconCollection["SAPIconsV5"] = "SAP-icons-v5";
    RegisteredIconCollection["SAPIconsTNTV2"] = "tnt-v2";
    RegisteredIconCollection["SAPIconsTNTV3"] = "tnt-v3";
    RegisteredIconCollection["SAPBSIconsV1"] = "business-suite-v1";
    RegisteredIconCollection["SAPBSIconsV2"] = "business-suite-v2";
  })(RegisteredIconCollection || (_exports.RegisteredIconCollection = RegisteredIconCollection = {}));
  /**
   * Sets the default icon collection for a given theme.
   *
   * SAP Icons is the default icon collection (that resolves to SAP-icons version 5.x in Horizon theme family and SAP-icons version 4.x in all other themes)
   * and to display icons from other collections, you have to specify the icon collection in addition to the icon name, for example: "tnt/actor", "business-suite/1x2-grid-layout", etc.
   * This method allows setting another (built-in or custom) icon collection as default per theme.
   *
   * <b>Usage</b>
   * <b>For example</b>, to make "SAP-icons version 5.x" the default icon collection in "sap_fiori_3":
   *
   * <pre>
   * setDefaultIconCollection("sap_fiori_3", "SAP-icons-v5");
   *
   * <ui5-icon name="home"></ui5-icon>
   * </pre>
   *
   * <b>For example</b>, to make a custom icon collection (with name "my-custom-collection") the default icon collection in "sap_fiori_3":
   *
   * <pre>
   * setDefaultIconCollection("sap_fiori_3", "my-custom-collection");
   *
   * <ui5-icon name="custom-icon-name"></ui5-icon>
   * </pre>
   *
   * @public
   * @param { string } theme
   * @param { string } collectionName
   */
  const setDefaultIconCollection = (theme, collectionName) => {
    IconCollectionConfiguration.set(theme, collectionName);
  };
  /**
   * Returns the configured default icon collection for a given theme.
   *
   * @param { string } theme
   * @public
   * @returns { string | undefined }
   */
  _exports.setDefaultIconCollection = setDefaultIconCollection;
  const getDefaultIconCollection = theme => {
    return IconCollectionConfiguration.get(theme);
  };
  /**
   * Returns the effective icon collection,
   * based on the default icon collection configuration and the current theme:
   * @param { IconCollection } collectionName
   * @returns { IconCollection } the effective collection name
   */
  _exports.getDefaultIconCollection = getDefaultIconCollection;
  const getEffectiveIconCollection = collectionName => {
    const currentTheme = (0, _Theme.getTheme)();
    const currentThemeConfiguration = IconCollectionConfiguration.get(currentTheme);
    // when no collection is set and default collection is configured - return the configured icon collection
    if (!collectionName && currentThemeConfiguration) {
      return (0, _IconCollectionsAlias.getIconCollectionByAlias)(currentThemeConfiguration);
    }
    // when collection is set - return the theme dependant icon collection
    // when collection is not set and there is no default icon collection configured - return theme dependant icon collection
    return getIconCollectionByTheme(collectionName);
  };
  /**
   * Returns the icon theme dependant collection, based on the collection name and current theme as follows:
   *
   * - "no collection" resolves to "SAP-icons-v4" in "Quartz" and "Belize", and to "SAP-icons-v5" in "Horizon" (or as confugred via setDefaultIconCollection)
   * - "SAP-icons-v4" (and its alias "SAP-icons") forces "SAP-icons v4" in any theme and resolves to itself "SAP-icons-v4"
   * - "SAP-icons-v5" (and its alias "horizon") forces  "SAP-icons v5" in any theme and resolves to itself "SAP-icons-v5"
   * - "tnt" (and its alias "SAP-icons-TNT") resolves to "tnt-v2" in "Quartz", "Belize", and resolves to "tnt-v3" in "Horizon"
   * - "tnt-v2" forces "TNT icons v2" in any theme and resolves to itself "tnt-v2"
   * - "tnt-v3" forces "TNT icons v3" in any theme and resolves to itself "tnt-v3"
   * - "business-suite" (and its alias "BusinessSuiteInAppSymbols") resolves to "business-suite-v1" in "Quartz", "Belize", and resolves to "business-suite-v2" in "Horizon"
   * - "business-suite-v1" forces "Business Suite icons v1" in any theme and resolves to itself "business-suite-v1"
   * - "business-suite-v2" forces "Business Suite icons v2" in any theme and resolves to itself "business-suite-v2"
   *
   * <b>Note:</b> "SAP-icons-v4", "SAP-icons-v5", "tnt-v2", "tnt-v3", "business-suite-v1" and "business-suite-v2" are just returned
   * @param { IconCollection } collectionName
   * @returns { RegisteredIconCollection } the registered collection name
   */
  _exports.getEffectiveIconCollection = getEffectiveIconCollection;
  const getIconCollectionByTheme = collectionName => {
    const legacyThemeFamily = (0, _Theme.isLegacyThemeFamily)();
    if (!collectionName) {
      return legacyThemeFamily ? RegisteredIconCollection.SAPIconsV4 : RegisteredIconCollection.SAPIconsV5;
    }
    if (collectionName === "tnt") {
      return legacyThemeFamily ? RegisteredIconCollection.SAPIconsTNTV2 : RegisteredIconCollection.SAPIconsTNTV3;
    }
    if (collectionName === "business-suite") {
      return legacyThemeFamily ? RegisteredIconCollection.SAPBSIconsV1 : RegisteredIconCollection.SAPBSIconsV2;
    }
    return collectionName;
  };
});