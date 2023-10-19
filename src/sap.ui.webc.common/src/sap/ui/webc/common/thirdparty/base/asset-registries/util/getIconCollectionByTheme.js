sap.ui.define(["exports", "../../config/Theme", "../../config/Icons", "./IconCollectionsAlias", "./IconCollectionsByTheme"], function (_exports, _Theme, _Icons, _IconCollectionsAlias, _IconCollectionsByTheme) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Returns the effective theme dependant icon collection:
   *
   * - "no collection" resolves to "SAP-icons-v4" in "Quartz" and "Belize", and to "SAP-icons-v5" in "Horizon"
   * - "tnt" (and its alias "SAP-icons-TNT") resolves to "tnt-v2" in "Quartz", "Belize", and resolves to "tnt-v3" in "Horizon"
   * - "business-suite" (and its alias "BusinessSuiteInAppSymbols") resolves to "business-suite-v1" in "Quartz", "Belize", and resolves to "business-suite-v2" in "Horizon"
   *
   * @param { IconCollection } collectionName
   * @returns { IconCollection } the effective collection name
   */
  const getEffectiveIconCollection = collectionName => {
    const defaultIconCollection = (0, _Icons.getDefaultIconCollection)((0, _Theme.getTheme)());
    // no collection + default collection, configured via setDefaultIconCollection - return the configured icon collection.
    if (!collectionName && defaultIconCollection) {
      return (0, _IconCollectionsAlias.getIconCollectionByAlias)(defaultIconCollection);
    }
    // no collection - return "SAP-icons-v4" or  "SAP-icons-v5".
    if (!collectionName) {
      return (0, _IconCollectionsByTheme.getIconCollectionForTheme)("SAP-icons");
    }
    // has collection - return "SAP-icons-v4", "SAP-icons-v5", "tnt-v1", "tnt-v2", "business-suite-v1", "business-suite-v2", or custom ones.
    return (0, _IconCollectionsByTheme.getIconCollectionForTheme)(collectionName);
  };
  var _default = getEffectiveIconCollection;
  _exports.default = _default;
});