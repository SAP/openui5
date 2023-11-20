sap.ui.define(["exports", "../../config/Theme"], function (_exports, _Theme) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerIconCollectionForTheme = _exports.getIconCollectionForTheme = _exports.RegisteredIconCollection = void 0;
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
  const iconCollections = new Map();
  iconCollections.set("SAP-icons", {
    "legacy": RegisteredIconCollection.SAPIconsV4,
    "sap_horizon": RegisteredIconCollection.SAPIconsV5
  });
  iconCollections.set("tnt", {
    "legacy": RegisteredIconCollection.SAPIconsTNTV2,
    "sap_horizon": RegisteredIconCollection.SAPIconsTNTV3
  });
  iconCollections.set("business-suite", {
    "legacy": RegisteredIconCollection.SAPBSIconsV1,
    "sap_horizon": RegisteredIconCollection.SAPBSIconsV2
  });
  /**
   * Registers collection version per theme.
   * </b>For exmaple:</b> registerIconCollectionForTheme("my-custom-icons", {"sap_horizon": "my-custom-icons-v5"})
   * @param { string } collectionName
   * @param { ThemeToCollectionMap } themeCollectionMap
   */
  const registerIconCollectionForTheme = (collectionName, themeCollectionMap) => {
    if (iconCollections.has(collectionName)) {
      iconCollections.set(collectionName, {
        ...themeCollectionMap,
        ...iconCollections.get(collectionName)
      });
      return;
    }
    iconCollections.set(collectionName, themeCollectionMap);
  };
  _exports.registerIconCollectionForTheme = registerIconCollectionForTheme;
  const getIconCollectionForTheme = collectionName => {
    const themeFamily = (0, _Theme.isLegacyThemeFamily)() ? "legacy" : "sap_horizon";
    return iconCollections.has(collectionName) ? iconCollections.get(collectionName)[themeFamily] : collectionName;
  };
  _exports.getIconCollectionForTheme = getIconCollectionForTheme;
});