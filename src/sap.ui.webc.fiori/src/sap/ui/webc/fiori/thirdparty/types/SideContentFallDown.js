sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * SideContent FallDown options.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.SideContentFallDown
   */
  var SideContentFallDown;
  (function (SideContentFallDown) {
    /**
     * Side content falls down on breakpoints below XL
     * @public
     * @type {BelowXL}
     */
    SideContentFallDown["BelowXL"] = "BelowXL";
    /**
     * Side content falls down on breakpoints below L
     * @public
     * @type {BelowL}
     */
    SideContentFallDown["BelowL"] = "BelowL";
    /**
     * Side content falls down on breakpoints below M
     * @public
     * @type {BelowM}
     */
    SideContentFallDown["BelowM"] = "BelowM";
    /**
     * Side content falls down on breakpoint M and the minimum width for the side content
     * @public
     * @type {OnMinimumWidth}
     */
    SideContentFallDown["OnMinimumWidth"] = "OnMinimumWidth";
  })(SideContentFallDown || (SideContentFallDown = {}));
  var _default = SideContentFallDown;
  _exports.default = _default;
});