sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different list item types.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.ListItemType
   */
  var ListItemType;
  (function (ListItemType) {
    /**
     * Indicates the list item does not have any active feedback when item is pressed.
     * @public
     * @type {Inactive}
     */
    ListItemType["Inactive"] = "Inactive";
    /**
     * Indicates that the item is clickable via active feedback when item is pressed.
     * @public
     * @type {Active}
     */
    ListItemType["Active"] = "Active";
    /**
     * Enables detail button of the list item that fires detail-click event.
     * @public
     * @type {Detail}
     */
    ListItemType["Detail"] = "Detail";
    /**
     * Enables the type of navigation, which is specified to add an arrow at the end of the items and fires navigate-click event.
     * @public
     * @type {Navigation}
     */
    ListItemType["Navigation"] = "Navigation";
  })(ListItemType || (ListItemType = {}));
  var _default = ListItemType;
  _exports.default = _default;
});