sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different BusyIndicator sizes.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.BusyIndicatorSize
   */
  var BusyIndicatorSize;
  (function (BusyIndicatorSize) {
    /**
     * small size
     * @public
     * @type {Small}
     */
    BusyIndicatorSize["Small"] = "Small";
    /**
     * medium size
     * @public
     * @type {Medium}
     */
    BusyIndicatorSize["Medium"] = "Medium";
    /**
     * large size
     * @public
     * @type {Large}
     */
    BusyIndicatorSize["Large"] = "Large";
  })(BusyIndicatorSize || (BusyIndicatorSize = {}));
  var _default = BusyIndicatorSize;
  _exports.default = _default;
});