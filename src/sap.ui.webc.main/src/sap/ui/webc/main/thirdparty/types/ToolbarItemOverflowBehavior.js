sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Defines the priority of the toolbar item to go inside overflow popover.
   *
   * @readonly
   * @enum {string}
   * @public
   * @type {string}
   * @author SAP SE
   * @alias sap.ui.webc.main.types.ToolbarItemOverflowBehavior
   */
  var ToolbarItemOverflowBehavior;
  (function (ToolbarItemOverflowBehavior) {
    /**
     * The item is presented inside the toolbar and goes in the popover, when there is not enough space.
     * @public
     * @type {Default}
     */
    ToolbarItemOverflowBehavior["Default"] = "Default";
    /**
     * When set, the item will never go to the overflow popover.
     * @public
     * @type {NeverOverflow}
     */
    ToolbarItemOverflowBehavior["NeverOverflow"] = "NeverOverflow";
    /**
     * @public
     * When set, the item will be always part of the overflow part of ui5-toolbar.
     * @type {AlwaysOverflow}
     */
    ToolbarItemOverflowBehavior["AlwaysOverflow"] = "AlwaysOverflow";
  })(ToolbarItemOverflowBehavior || (ToolbarItemOverflowBehavior = {}));
  var _default = ToolbarItemOverflowBehavior;
  _exports.default = _default;
});