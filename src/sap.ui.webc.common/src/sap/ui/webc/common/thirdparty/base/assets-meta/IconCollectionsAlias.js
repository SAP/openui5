sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Supported icon collection names and aliases.
   *
   * Users might specify a collection, using both the key and the value in the following key-value pairs,
   * e.g the following pairs are completely exchangeable:
   * "SAP-icons-TNT/actor" and "tnt/actor", "BusinessSuiteInAppSymbols/3d" and "business-suite/3d",
   * "SAP-icons-v5/accept" and "horizon/accept".
   *
   * Note: technically, in the code we maintain the collections under the "value" name - "tnt", "business-suite",
   * SAP-icons-v5" and "SAP-icons"(which does not have an alias).
   */
  const IconCollectionsAlias = {
    "SAP-icons-TNT": "tnt",
    "BusinessSuiteInAppSymbols": "business-suite",
    "horizon": "SAP-icons-v5"
  };
  var _default = IconCollectionsAlias;
  _exports.default = _default;
});