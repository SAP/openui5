sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Tabs overflow mode in TabContainer.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TabsOverflowMode
   */
  var TabsOverflowMode;
  (function (TabsOverflowMode) {
    /**
     * End type is used if there should be only one overflow with hidden the tabs at the end of the tab container.
     * @public
     * @type {End}
     */
    TabsOverflowMode["End"] = "End";
    /**
     * StartAndEnd type is used if there should be two overflows on both ends of the tab container.
     * @public
     * @type {StartAndEnd}
     */
    TabsOverflowMode["StartAndEnd"] = "StartAndEnd";
  })(TabsOverflowMode || (TabsOverflowMode = {}));
  var _default = TabsOverflowMode;
  _exports.default = _default;
});