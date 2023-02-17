sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.TableMode.prototype
   * @public
   */
  const TableModes = {
    /**
     * Default mode (no selection).
     * @public
     * @type {None}
     */
    None: "None",
    /**
     * Single selection mode (only one table row can be selected).
     * @public
     * @type {SingleSelect}
     */
    SingleSelect: "SingleSelect",
    /**
     * Multi selection mode (more than one table row can be selected).
     * @public
     * @type {MultiSelect}
     */
    MultiSelect: "MultiSelect"
  };

  /**
   * @class
   * Defines the type of <code>ui5-table</code>.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.TableMode
   * @public
   * @enum {string}
   */
  class TableMode extends _DataType.default {
    static isValid(value) {
      return !!TableModes[value];
    }
  }
  TableMode.generateTypeAccessors(TableModes);
  var _default = TableMode;
  _exports.default = _default;
});