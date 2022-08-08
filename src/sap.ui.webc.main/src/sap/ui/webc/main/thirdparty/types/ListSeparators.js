sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.ListSeparators.prototype
   * @public
   */
  const ListSeparatorsTypes = {
    /**
     * Separators between the items including the last and the first one.
     * @public
     * @type {All}
     */
    All: "All",

    /**
     * Separators between the items.
     * <b>Note:</b> This enumeration depends on the theme.
     * @public
     * @type {Inner}
     */
    Inner: "Inner",

    /**
     * No item separators.
     * @public
     * @type {None}
     */
    None: "None"
  };
  /**
   * @class
   * Defines which separator style will be applied for the list items.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.ListSeparators
   * @public
   * @enum {string}
   */

  class ListSeparators extends _DataType.default {
    static isValid(value) {
      return !!ListSeparatorsTypes[value];
    }

  }

  ListSeparators.generateTypeAccessors(ListSeparatorsTypes);
  var _default = ListSeparators;
  _exports.default = _default;
});