sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different filtering types of the ComboBox.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.ComboBoxFilter
   */
  var ComboBoxFilter;
  (function (ComboBoxFilter) {
    /**
     * Defines filtering by first symbol of each word of item's text.
     * @public
     * @type {StartsWithPerTerm}
     */
    ComboBoxFilter["StartsWithPerTerm"] = "StartsWithPerTerm";
    /**
     * Defines filtering by starting symbol of item's text.
     * @public
     * @type {StartsWith}
     */
    ComboBoxFilter["StartsWith"] = "StartsWith";
    /**
     * Defines contains filtering.
     * @public
     * @type {Contains}
     */
    ComboBoxFilter["Contains"] = "Contains";
    /**
     * Removes any filtering applied while typing
     * @public
     * @type {None}
     */
    ComboBoxFilter["None"] = "None";
  })(ComboBoxFilter || (ComboBoxFilter = {}));
  var _default = ComboBoxFilter;
  _exports.default = _default;
});