sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Table cell popin display.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TableColumnPopinDisplay
   */
  var TableColumnPopinDisplay;
  (function (TableColumnPopinDisplay) {
    /**
     * default type
     * @public
     * @type {Block}
     */
    TableColumnPopinDisplay["Block"] = "Block";
    /**
     * inline type (the title and value are displayed on the same line)
     * @public
     * @type {Inline}
     */
    TableColumnPopinDisplay["Inline"] = "Inline";
  })(TableColumnPopinDisplay || (TableColumnPopinDisplay = {}));
  var _default = TableColumnPopinDisplay;
  _exports.default = _default;
});