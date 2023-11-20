sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different Calendar selection mode.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.CalendarSelectionMode
   */
  var CalendarSelectionMode;
  (function (CalendarSelectionMode) {
    /**
     * Only one date can be selected at a time
     * @public
     * @type {Single}
     */
    CalendarSelectionMode["Single"] = "Single";
    /**
     * Several dates can be selected
     * @public
     * @type {Multiple}
     */
    CalendarSelectionMode["Multiple"] = "Multiple";
    /**
     * A range defined by a start date and an end date can be selected
     * @public
     * @type {Range}
     */
    CalendarSelectionMode["Range"] = "Range";
  })(CalendarSelectionMode || (CalendarSelectionMode = {}));
  var _default = CalendarSelectionMode;
  _exports.default = _default;
});