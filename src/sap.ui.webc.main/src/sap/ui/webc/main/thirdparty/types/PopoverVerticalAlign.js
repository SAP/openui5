sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Popover vertical align types.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.PopoverVerticalAlign
   */
  var PopoverVerticalAlign;
  (function (PopoverVerticalAlign) {
    /**
     *
     * @public
     * @type {Center}
     */
    PopoverVerticalAlign["Center"] = "Center";
    /**
     * Popover will be placed at the top of the reference control.
     * @public
     * @type {Top}
     */
    PopoverVerticalAlign["Top"] = "Top";
    /**
     * Popover will be placed at the bottom of the reference control.
     * @public
     * @type {Bottom}
     */
    PopoverVerticalAlign["Bottom"] = "Bottom";
    /**
     * Popover will be streched
     * @public
     * @type {Stretch}
     */
    PopoverVerticalAlign["Stretch"] = "Stretch";
  })(PopoverVerticalAlign || (PopoverVerticalAlign = {}));
  var _default = PopoverVerticalAlign;
  _exports.default = _default;
});