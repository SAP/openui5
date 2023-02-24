sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.fiori.types.ViewSettingsDialogMode.prototype
   * @public
   */
  const ModeTypes = {
    /**
     * Default type
     * @since 1.0.0-rc.16
     * @public
     * @type {Sort}
     */
    Sort: "Sort",
    /**
     * Filter type
     * @since 1.0.0-rc.16
     * @public
     * @type {Filter}
     */
    Filter: "Filter"
  };

  /**
   * @class
   * Different types of Bar.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.ViewSettingsDialogMode
   * @private
   * @since 1.0.0-rc.16
   * @enum {string}
   */
  class ViewSettingsDialogMode extends _DataType.default {
    static isValid(value) {
      return !!ModeTypes[value];
    }
  }
  ViewSettingsDialogMode.generateTypeAccessors(ModeTypes);
  var _default = ViewSettingsDialogMode;
  _exports.default = _default;
});