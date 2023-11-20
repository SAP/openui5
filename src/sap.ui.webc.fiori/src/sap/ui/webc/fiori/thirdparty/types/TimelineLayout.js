sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Available Timeline layout orientation
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.TimelineLayout
   */
  var TimelineLayout;
  (function (TimelineLayout) {
    /**
     * Vertical layout
     * Default type
     * @public
     * @type {Vertical}
     */
    TimelineLayout["Vertical"] = "Vertical";
    /**
     * Horizontal layout
     * @public
     * @type {Horizontal}
     */
    TimelineLayout["Horizontal"] = "Horizontal";
  })(TimelineLayout || (TimelineLayout = {}));
  var _default = TimelineLayout;
  _exports.default = _default;
});