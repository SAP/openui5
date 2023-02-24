sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Different types of HasPopup.
   * @lends sap.ui.webcomponents.main.types.HasPopup.prototype
   * @public
   */
  const PopupTypes = {
    /**
     * Dialog popup type.
     * @public
     * @type {Dialog}
     */
    Dialog: "Dialog",
    /**
     * Grid popup type.
     * @public
     * @type {Grid}
     */
    Grid: "Grid",
    /**
     * ListBox popup type.
     * @public
     * @type {ListBox}
     */
    ListBox: "ListBox",
    /**
     * Menu popup type.
     * @public
     * @type {Menu}
     */
    Menu: "Menu",
    /**
     * Tree popup type.
     * @public
     * @type {Tree}
     */
    Tree: "Tree"
  };

  /**
   * @class
   * Different types of HasPopup.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.HasPopup
   * @public
   * @enum {string}
   */
  class HasPopup extends _DataType.default {
    static isValid(value) {
      return !!PopupTypes[value];
    }
  }
  HasPopup.generateTypeAccessors(PopupTypes);
  var _default = HasPopup;
  _exports.default = _default;
});