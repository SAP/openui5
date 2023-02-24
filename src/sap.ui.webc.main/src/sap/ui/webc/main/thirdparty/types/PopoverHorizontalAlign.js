sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.PopoverHorizontalAlign.prototype
   * @public
   */
  const PopoverHorizontalAligns = {
    /**
     * Popover is centered
     * @public
     * @type {Center}
     */
    Center: "Center",
    /**
     * Popover opens on the left side of the target
     * @public
     * @type {Left}
     */
    Left: "Left",
    /**
     * Popover opens on the right side of the target
     * @public
     * @type {Right}
     */
    Right: "Right",
    /**
     * Popover is stretched
     * @public
     * @type {Stretch}
     */
    Stretch: "Stretch"
  };

  /**
   * @class
   * Defines the horizontal alignment of <code>ui5-popover</code>
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.PopoverHorizontalAlign
   * @public
   * @enum {string}
   */
  class PopoverHorizontalAlign extends _DataType.default {
    static isValid(value) {
      return !!PopoverHorizontalAligns[value];
    }
  }
  PopoverHorizontalAlign.generateTypeAccessors(PopoverHorizontalAligns);
  var _default = PopoverHorizontalAlign;
  _exports.default = _default;
});