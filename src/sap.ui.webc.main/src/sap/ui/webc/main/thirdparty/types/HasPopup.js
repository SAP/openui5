sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of HasPopup.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.HasPopup
   */
  var HasPopup;
  (function (HasPopup) {
    /**
     * Dialog popup type.
     * @public
     * @type {Dialog}
     */
    HasPopup["Dialog"] = "Dialog";
    /**
     * Grid popup type.
     * @public
     * @type {Grid}
     */
    HasPopup["Grid"] = "Grid";
    /**
     * ListBox popup type.
     * @public
     * @type {ListBox}
     */
    HasPopup["ListBox"] = "ListBox";
    /**
     * Menu popup type.
     * @public
     * @type {Menu}
     */
    HasPopup["Menu"] = "Menu";
    /**
     * Tree popup type.
     * @public
     * @type {Tree}
     */
    HasPopup["Tree"] = "Tree";
  })(HasPopup || (HasPopup = {}));
  var _default = HasPopup;
  _exports.default = _default;
});