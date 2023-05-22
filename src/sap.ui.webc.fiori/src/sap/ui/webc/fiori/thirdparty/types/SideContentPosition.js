sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Side Content position options.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.SideContentPosition
   */
  var SideContentPosition;
  (function (SideContentPosition) {
    /**
     * The side content is on the right side of the main container
     * in left-to-right mode and on the left side in right-to-left mode.
     * @public
     * @type {End}
     */
    SideContentPosition["End"] = "End";
    /**
     * The side content is on the left side of the main container
     * in left-to-right mode and on the right side in right-to-left mode.
     * @public
     * @type {Start}
     */
    SideContentPosition["Start"] = "Start";
  })(SideContentPosition || (SideContentPosition = {}));
  var _default = SideContentPosition;
  _exports.default = _default;
});