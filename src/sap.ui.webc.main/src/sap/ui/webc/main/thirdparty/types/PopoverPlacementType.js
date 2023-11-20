sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Popover placement types.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.PopoverPlacementType
   */
  var PopoverPlacementType;
  (function (PopoverPlacementType) {
    /**
     * Popover will be placed at the left side of the reference element.
     * @public
     * @type {Left}
     */
    PopoverPlacementType["Left"] = "Left";
    /**
     * Popover will be placed at the right side of the reference element.
     * @public
     * @type {Right}
     */
    PopoverPlacementType["Right"] = "Right";
    /**
     * Popover will be placed at the top of the reference element.
     * @public
     * @type {Top}
     */
    PopoverPlacementType["Top"] = "Top";
    /**
     * Popover will be placed at the bottom of the reference element.
     * @public
     * @type {Bottom}
     */
    PopoverPlacementType["Bottom"] = "Bottom";
  })(PopoverPlacementType || (PopoverPlacementType = {}));
  var _default = PopoverPlacementType;
  _exports.default = _default;
});