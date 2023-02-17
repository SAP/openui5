sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.TabLayout.prototype
   * @public
   */
  const TabLayouts = {
    /**
     * Inline type, the tab <code>main text</code> and <code>additionalText</code> are displayed horizotally.
     * @public
     * @type {Inline}
     */
    Inline: "Inline",
    /**
     * Standard type, the tab <code>main text</code> and <code>additionalText</code> are displayed vertically.
     * @public
     * @type {Standard}
     */
    Standard: "Standard"
  };

  /**
   * @class
   * Different types of Tab layouts.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.TabLayout
   * @public
   * @enum {string}
   */
  class TabLayout extends _DataType.default {
    static isValid(value) {
      return !!TabLayouts[value];
    }
  }
  TabLayout.generateTypeAccessors(TabLayouts);
  var _default = TabLayout;
  _exports.default = _default;
});