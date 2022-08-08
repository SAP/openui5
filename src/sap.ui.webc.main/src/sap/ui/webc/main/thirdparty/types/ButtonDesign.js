sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.ButtonDesign.prototype
   * @public
   */
  const ButtonTypes = {
    /**
     * default type (no special styling)
     * @public
     * @type {Default}
     */
    Default: "Default",

    /**
     * accept type (green button)
     * @public
     * @type {Positive}
     */
    Positive: "Positive",

    /**
     * reject style (red button)
     * @public
     * @type {Negative}
     */
    Negative: "Negative",

    /**
     * transparent type
     * @public
     * @type {Transparent}
     */
    Transparent: "Transparent",

    /**
     * emphasized type
     * @public
     * @type {Emphasized}
     */
    Emphasized: "Emphasized",

    /**
     * attention type
     * @public
     * @type {Attention}
     */
    Attention: "Attention"
  };
  /**
   * @class
   * Different types of Button.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.ButtonDesign
   * @public
   * @enum {string}
   */

  class ButtonDesign extends _DataType.default {
    static isValid(value) {
      return !!ButtonTypes[value];
    }

  }

  ButtonDesign.generateTypeAccessors(ButtonTypes);
  var _default = ButtonDesign;
  _exports.default = _default;
});