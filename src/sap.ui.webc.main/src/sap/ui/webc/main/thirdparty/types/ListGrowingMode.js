sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different list growing modes.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.ListGrowingMode
   */
  var ListGrowingMode;
  (function (ListGrowingMode) {
    /**
     * Component's "load-more" is fired upon pressing a "More" button.
     * at the bottom.
     * @public
     * @type {Button}
     */
    ListGrowingMode["Button"] = "Button";
    /**
     * Component's "load-more" is fired upon scroll.
     * @public
     * @type {Scroll}
     */
    ListGrowingMode["Scroll"] = "Scroll";
    /**
     * Component's growing is not enabled.
     * @public
     * @type {None}
     */
    ListGrowingMode["None"] = "None";
  })(ListGrowingMode || (ListGrowingMode = {}));
  var _default = ListGrowingMode;
  _exports.default = _default;
});