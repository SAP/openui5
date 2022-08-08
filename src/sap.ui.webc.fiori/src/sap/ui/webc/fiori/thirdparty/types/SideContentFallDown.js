sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.fiori.types.SideContentFallDown.prototype
   * @public
   */
  const SideContentFallDownTypes = {
    /**
     * Side content falls down on breakpoints below XL
     * @public
     * @type {BelowXL}
     */
    BelowXL: "BelowXL",

    /**
     * Side content falls down on breakpoints below L
     * @public
     * @type {BelowL}
     */
    BelowL: "BelowL",

    /**
     * Side content falls down on breakpoints below M
     * @public
     * @type {BelowM}
     */
    BelowM: "BelowM",

    /**
     * Side content falls down on breakpoint M and the minimum width for the side content
     * @public
     * @type {OnMinimumWidth}
     */
    OnMinimumWidth: "OnMinimumWidth"
  };
  /**
   * @class
   * SideContent FallDown options.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.SideContentFallDown
   * @public
   * @enum {string}
   */

  class SideContentFallDown extends _DataType.default {
    static isValid(value) {
      return !!SideContentFallDownTypes[value];
    }

  }

  SideContentFallDown.generateTypeAccessors(SideContentFallDownTypes);
  var _default = SideContentFallDown;
  _exports.default = _default;
});