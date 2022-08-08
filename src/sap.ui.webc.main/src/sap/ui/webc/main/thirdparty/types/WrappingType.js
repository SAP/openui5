sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different types of wrapping.
   * @lends sap.ui.webcomponents.main.types.WrappingType.prototype
   * @public
   */
  const WrappingTypes = {
    /**
     * The text will be truncated with an ellipsis.
     * @public
     * @type {None}
     */
    None: "None",

    /**
     * The text will wrap. The words will not be broken based on hyphenation.
     * @public
     * @type {Normal}
     */
    Normal: "Normal"
  };
  /**
   * @class
   * Defines how the text of a component will be displayed when there is not enough space.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.WrappingType
   * @public
   * @enum {string}
   */

  class WrappingType extends _DataType.default {
    static isValid(value) {
      return !!WrappingTypes[value];
    }

  }

  WrappingType.generateTypeAccessors(WrappingTypes);
  var _default = WrappingType;
  _exports.default = _default;
});