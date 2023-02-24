sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.PopoverPlacementType.prototype
   * @public
   */
  const PopoverPlacementTypes = {
    /**
     * Popover will be placed at the left side of the reference element.
     * @public
     * @type {Left}
     */
    Left: "Left",
    /**
     * Popover will be placed at the right side of the reference element.
     * @public
     * @type {Right}
     */
    Right: "Right",
    /**
     * Popover will be placed at the top of the reference element.
     * @public
     * @type {Top}
     */
    Top: "Top",
    /**
     * Popover will be placed at the bottom of the reference element.
     * @public
     * @type {Bottom}
     */
    Bottom: "Bottom"
  };

  /**
   * @class
   * Types for the placement of Popover control.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.PopoverPlacementType
   * @public
   * @enum {string}
   */
  class PopoverPlacementType extends _DataType.default {
    static isValid(value) {
      return !!PopoverPlacementTypes[value];
    }
  }
  PopoverPlacementType.generateTypeAccessors(PopoverPlacementTypes);
  var _default = PopoverPlacementType;
  _exports.default = _default;
});