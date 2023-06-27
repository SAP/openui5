sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of Bar.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.ViewSettingsDialogMode
   */
  var ViewSettingsDialogMode;
  (function (ViewSettingsDialogMode) {
    /**
     * Default type
     * @since 1.0.0-rc.16
     * @public
     * @type {Sort}
     */
    ViewSettingsDialogMode["Sort"] = "Sort";
    /**
     * Filter type
     * @since 1.0.0-rc.16
     * @public
     * @type {Filter}
     */
    ViewSettingsDialogMode["Filter"] = "Filter";
  })(ViewSettingsDialogMode || (ViewSettingsDialogMode = {}));
  var _default = ViewSettingsDialogMode;
  _exports.default = _default;
});