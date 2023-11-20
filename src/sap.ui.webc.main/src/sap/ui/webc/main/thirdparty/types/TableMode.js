sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different table modes.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TableMode
   */
  var TableMode;
  (function (TableMode) {
    /**
     * Default mode (no selection).
     * @public
     * @type {None}
     */
    TableMode["None"] = "None";
    /**
     * Single selection mode (only one table row can be selected).
     * @public
     * @type {SingleSelect}
     */
    TableMode["SingleSelect"] = "SingleSelect";
    /**
     * Multi selection mode (more than one table row can be selected).
     * @public
     * @type {MultiSelect}
     */
    TableMode["MultiSelect"] = "MultiSelect";
  })(TableMode || (TableMode = {}));
  var _default = TableMode;
  _exports.default = _default;
});