sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Popup accessible roles.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.PopupAccessibleRole
   */
  var PopupAccessibleRole;
  (function (PopupAccessibleRole) {
    /**
     * Represents no ARIA role.
     * @public
     * @type {None}
     */
    PopupAccessibleRole["None"] = "None";
    /**
     * Represents the ARIA role "dialog".
     * @public
     * @type {Dialog}
     */
    PopupAccessibleRole["Dialog"] = "Dialog";
    /**
     * Represents the ARIA role "alertdialog".
     * @public
     * @type {AlertDialog}
     */
    PopupAccessibleRole["AlertDialog"] = "AlertDialog";
  })(PopupAccessibleRole || (PopupAccessibleRole = {}));
  var _default = PopupAccessibleRole;
  _exports.default = _default;
});