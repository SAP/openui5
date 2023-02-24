sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * @private
   * Different behavior for ItemNavigation.
   */
  const ItemNavigationBehavior = {
    /**
    * Static behavior: navigations stops at the first or last item.
    	*/
    Static: "Static",
    /**
    * Cycling behavior: navigating past the last item continues with the first and vice versa.
    	*/
    Cyclic: "Cyclic"
  };
  var _default = ItemNavigationBehavior;
  _exports.default = _default;
});