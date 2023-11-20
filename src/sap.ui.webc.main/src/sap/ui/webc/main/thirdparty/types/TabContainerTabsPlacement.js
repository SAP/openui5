sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Tabs placement of TabContainer.
   *
   * @readonly
   * @enum {string}
   * @private
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TabContainerTabsPlacement
   */
  var TabContainerTabsPlacement;
  (function (TabContainerTabsPlacement) {
    /**
     * The tab strip is displayed above the tab content (Default)
     * @private
     * @type {Top}
     */
    TabContainerTabsPlacement["Top"] = "Top";
    /**
     * The tab strip is displayed below the tab content
     * @private
     * @type {Bottom}
     */
    TabContainerTabsPlacement["Bottom"] = "Bottom";
  })(TabContainerTabsPlacement || (TabContainerTabsPlacement = {}));
  var _default = TabContainerTabsPlacement;
  _exports.default = _default;
});