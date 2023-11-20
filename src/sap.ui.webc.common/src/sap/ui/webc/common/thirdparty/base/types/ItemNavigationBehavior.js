sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different behavior for ItemNavigation.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.base.types.ItemNavigationBehavior
   */
  var ItemNavigationBehavior;
  (function (ItemNavigationBehavior) {
    /**
     * Static behavior: navigations stops at the first or last item.
     * @public
     * @type {Static}
     */
    ItemNavigationBehavior["Static"] = "Static";
    /**
     * Cycling behavior: navigating past the last item continues with the first and vice versa.
     * @public
     * @type {Cyclic}
     */
    ItemNavigationBehavior["Cyclic"] = "Cyclic";
  })(ItemNavigationBehavior || (ItemNavigationBehavior = {}));
  var _default = ItemNavigationBehavior;
  _exports.default = _default;
});