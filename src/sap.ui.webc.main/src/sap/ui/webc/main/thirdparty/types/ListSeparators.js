sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of list items separators.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.ListSeparators
   */
  var ListSeparators;
  (function (ListSeparators) {
    /**
     * Separators between the items including the last and the first one.
     * @public
     * @type {All}
     */
    ListSeparators["All"] = "All";
    /**
     * Separators between the items.
     * Note: This enumeration depends on the theme.
     * @public
     * @type {Inner}
     */
    ListSeparators["Inner"] = "Inner";
    /**
     * No item separators.
     * @public
     * @type {None}
     */
    ListSeparators["None"] = "None";
  })(ListSeparators || (ListSeparators = {}));
  var _default = ListSeparators;
  _exports.default = _default;
});