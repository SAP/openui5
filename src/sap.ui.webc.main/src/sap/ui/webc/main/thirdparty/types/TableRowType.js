sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.TableRowType.prototype
   * @public
   */
  const TableRowTypes = {
    /**
     * Indicates that the table row does not have any active feedback when item is pressed.
     * @public
     * @type {Inactive}
     */
    Inactive: "Inactive",
    /**
     * Indicates that the table row is clickable via active feedback when item is pressed.
     * @public
     * @type {Active}
     */
    Active: "Active"
  };

  /**
   * @class
   * Different types of TableRow.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.TableRowType
   * @public
   * @enum {string}
   */
  class TableRowType extends _DataType.default {
    static isValid(value) {
      return !!TableRowTypes[value];
    }
  }
  TableRowType.generateTypeAccessors(TableRowTypes);
  var _default = TableRowType;
  _exports.default = _default;
});