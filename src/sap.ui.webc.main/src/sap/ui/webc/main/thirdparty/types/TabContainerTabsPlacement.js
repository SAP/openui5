sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.TabContainerTabsPlacement.prototype
   * @private
   */
  const TabContainerTabsPlacements = {
    /**
     * The tab strip is displayed above the tab content (Default)
     * @private
     * @type {Top}
     */
    Top: "Top",
    /**
     * The tab strip is displayed below the tab content
     * @private
     * @type {Bottom}
     */
    Bottom: "Bottom"
  };

  /**
   * @class
   * Different options for the position of the tab strip relative to the tab content area.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.TabContainerTabsPlacement
   * @private
   * @enum {string}
   */
  class TabContainerTabsPlacement extends _DataType.default {
    static isValid(value) {
      return !!TabContainerTabsPlacements[value];
    }
  }
  TabContainerTabsPlacement.generateTypeAccessors(TabContainerTabsPlacements);
  var _default = TabContainerTabsPlacement;
  _exports.default = _default;
});