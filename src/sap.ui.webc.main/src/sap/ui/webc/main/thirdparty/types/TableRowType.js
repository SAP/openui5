sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different table row types.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TableRowType
   */
  var TableRowType;
  (function (TableRowType) {
    /**
     * Indicates that the table row does not have any active feedback when item is pressed.
     * @public
     * @type {Inactive}
     */
    TableRowType["Inactive"] = "Inactive";
    /**
     * Indicates that the table row is clickable via active feedback when item is pressed.
     * @public
     * @type {Active}
     */
    TableRowType["Active"] = "Active";
  })(TableRowType || (TableRowType = {}));
  var _default = TableRowType;
  _exports.default = _default;
});