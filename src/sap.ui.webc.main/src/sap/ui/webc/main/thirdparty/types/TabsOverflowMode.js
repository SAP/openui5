sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.TabsOverflowMode.prototype
   * @public
   */
  const TabsOverflowModes = {
    /**
     * End type is used if there should be only one overflow with hidden the tabs at the end of the tab container.
     * @public
     * @type {End}
     */
    End: "End",

    /**
     * StartAndEnd type is used if there should be two overflows on both ends of the tab container.
     * @public
     * @type {StartAndEnd}
     */
    StartAndEnd: "StartAndEnd"
  };
  /**
   * @class
   * Different types of overflow modes.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.TabsOverflowMode
   * @public
   * @enum {string}
   */

  class TabsOverflowMode extends _DataType.default {
    static isValid(value) {
      return !!TabsOverflowModes[value];
    }

  }

  TabsOverflowMode.generateTypeAccessors(TabsOverflowModes);
  var _default = TabsOverflowMode;
  _exports.default = _default;
});