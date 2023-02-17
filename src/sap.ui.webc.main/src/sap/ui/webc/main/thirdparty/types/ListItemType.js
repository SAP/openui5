sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.ListItemType.prototype
   * @public
   */
  const ListItemTypes = {
    /**
     * Indicates the list item does not have any active feedback when item is pressed.
     * @public
     * @type {Inactive}
     */
    Inactive: "Inactive",
    /**
     * Indicates that the item is clickable via active feedback when item is pressed.
     * @public
     * @type {Active}
     */
    Active: "Active",
    /**
     * Enables detail button of the list item that fires detail-click event.
     * @public
     * @type {Detail}
     */
    Detail: "Detail"
  };

  /**
   * @class
   * Different types of ListItem.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.ListItemType
   * @public
   * @enum {string}
   */
  class ListItemType extends _DataType.default {
    static isValid(value) {
      return !!ListItemTypes[value];
    }
  }
  ListItemType.generateTypeAccessors(ListItemTypes);
  var _default = ListItemType;
  _exports.default = _default;
});