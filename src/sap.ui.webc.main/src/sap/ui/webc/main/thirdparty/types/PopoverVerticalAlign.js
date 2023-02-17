sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.PopoverVerticalAlign.prototype
   * @public
   */
  const PopoverVerticalAligns = {
    /**
     *
     * @public
     * @type {Center}
     */
    Center: "Center",
    /**
     * Popover will be placed at the top of the reference control.
     * @public
     * @type {Top}
     */
    Top: "Top",
    /**
     * Popover will be placed at the bottom of the reference control.
     * @public
     * @type {Bottom}
     */
    Bottom: "Bottom",
    /**
     * Popover will be streched
     * @public
     * @type {Stretch}
     */
    Stretch: "Stretch"
  };

  /**
   * @class
   * Types for the placement of message Popover control.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.PopoverVerticalAlign
   * @public
   * @enum {string}
   */
  class PopoverVerticalAlign extends _DataType.default {
    static isValid(value) {
      return !!PopoverVerticalAligns[value];
    }
  }
  PopoverVerticalAlign.generateTypeAccessors(PopoverVerticalAligns);
  var _default = PopoverVerticalAlign;
  _exports.default = _default;
});