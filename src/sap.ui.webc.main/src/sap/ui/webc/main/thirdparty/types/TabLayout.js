sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Tab layout of TabContainer.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TabLayout
   */
  var TabLayout;
  (function (TabLayout) {
    /**
     * Inline type, the tab "main text" and "additionalText" are displayed horizotally.
     * @public
     * @type {Inline}
     */
    TabLayout["Inline"] = "Inline";
    /**
     * Standard type, the tab "main text" and "additionalText" are displayed vertically.
     * @public
     * @type {Standard}
     */
    TabLayout["Standard"] = "Standard";
  })(TabLayout || (TabLayout = {}));
  var _default = TabLayout;
  _exports.default = _default;
});