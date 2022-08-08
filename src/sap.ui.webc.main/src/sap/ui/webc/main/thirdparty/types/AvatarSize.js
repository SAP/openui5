sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different types of AvatarSize.
   * @lends sap.ui.webcomponents.main.types.AvatarSize.prototype
   * @public
   */
  const AvatarSizes = {
    /**
     * component size - 2rem
     * font size - 1rem
     * @public
     * @type {XS}
     */
    XS: "XS",

    /**
     * component size - 3rem
     * font size - 1.5rem
     * @public
     * @type {S}
     */
    S: "S",

    /**
     * component size - 4rem
     * font size - 2rem
     * @public
     * @type {M}
     */
    M: "M",

    /**
     * component size - 5rem
     * font size - 2.5rem
     * @public
     * @type {L}
     */
    L: "L",

    /**
     * component size - 7rem
     * font size - 3rem
     * @public
     * @type {XL}
     */
    XL: "XL"
  };
  /**
   * @class
   * Different types of AvatarSize.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.AvatarSize
   * @public
   * @enum {string}
   */

  class AvatarSize extends _DataType.default {
    static isValid(value) {
      return !!AvatarSizes[value];
    }

  }

  AvatarSize.generateTypeAccessors(AvatarSizes);
  var _default = AvatarSize;
  _exports.default = _default;
});