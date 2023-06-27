sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Side Content visibility options.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.SideContentVisibility
   */
  var SideContentVisibility;
  (function (SideContentVisibility) {
    /**
     * Show the side content on any breakpoint
     * @public
     * @type {AlwaysShow}
     */
    SideContentVisibility["AlwaysShow"] = "AlwaysShow";
    /**
     * Show the side content on XL breakpoint
     * @public
     * @type {ShowAboveL}
     */
    SideContentVisibility["ShowAboveL"] = "ShowAboveL";
    /**
     * Show the side content on L and XL breakpoints
     * @public
     * @type {ShowAboveM}
     */
    SideContentVisibility["ShowAboveM"] = "ShowAboveM";
    /**
     * Show the side content on M, L and XL breakpoints
     * @public
     * @type {ShowAboveS}
     */
    SideContentVisibility["ShowAboveS"] = "ShowAboveS";
    /**
     * Don't show the side content on any breakpoints
     * @public
     * @type {NeverShow}
     */
    SideContentVisibility["NeverShow"] = "NeverShow";
  })(SideContentVisibility || (SideContentVisibility = {}));
  var _default = SideContentVisibility;
  _exports.default = _default;
});