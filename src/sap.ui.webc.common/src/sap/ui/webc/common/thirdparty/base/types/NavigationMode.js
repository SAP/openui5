sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different navigation modes for ItemNavigation.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.base.types.NavigationMode
   */
  var NavigationMode;
  (function (NavigationMode) {
    /**
     * @public
     * @type {Auto}
     */
    NavigationMode["Auto"] = "Auto";
    /**
     * @public
     * @type {Vertical}
     */
    NavigationMode["Vertical"] = "Vertical";
    /**
     * @public
     * @type {Horizontal}
     */
    NavigationMode["Horizontal"] = "Horizontal";
    /**
     * @public
     * @type {Paging}
     */
    NavigationMode["Paging"] = "Paging";
  })(NavigationMode || (NavigationMode = {}));
  var _default = NavigationMode;
  _exports.default = _default;
});