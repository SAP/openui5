sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.ListMode.prototype
   * @public
   */
  const ListModes = {
    /**
     * Default mode (no selection).
     * @public
     * @type {None}
     */
    None: "None",
    /**
     * Right-positioned single selection mode (only one list item can be selected).
     * @public
     * @type {SingleSelect}
     */
    SingleSelect: "SingleSelect",
    /**
     * Left-positioned single selection mode (only one list item can be selected).
     * @public
     * @type {SingleSelectBegin}
     */
    SingleSelectBegin: "SingleSelectBegin",
    /**
     * Selected item is highlighted but no selection element is visible
     * (only one list item can be selected).
     * @public
     * @type {SingleSelectEnd}
     */
    SingleSelectEnd: "SingleSelectEnd",
    /**
     * Selected item is highlighted and selection is changed upon arrow navigation
     * (only one list item can be selected - this is always the focused item).
     * @public
     * @type {SingleSelectAuto}
     */
    SingleSelectAuto: "SingleSelectAuto",
    /**
     * Multi selection mode (more than one list item can be selected).
     * @public
     * @type {MultiSelect}
     */
    MultiSelect: "MultiSelect",
    /**
     * Delete mode (only one list item can be deleted via provided delete button)
     * @public
     * @type {Delete}
     */
    Delete: "Delete"
  };

  /**
   * @class
   * Defines the type of <code>ui5-list</code>.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.ListMode
   * @public
   * @enum {string}
   */
  class ListMode extends _DataType.default {
    static isValid(value) {
      return !!ListModes[value];
    }
  }
  ListMode.generateTypeAccessors(ListModes);
  var _default = ListMode;
  _exports.default = _default;
});