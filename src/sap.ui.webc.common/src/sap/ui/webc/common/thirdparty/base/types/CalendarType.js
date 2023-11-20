sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different calendar types.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.base.types.CalendarType
   */
  var CalendarType;
  (function (CalendarType) {
    /**
     * @public
     * @type {Gregorian}
     */
    CalendarType["Gregorian"] = "Gregorian";
    /**
     * @public
     * @type {Islamic}
     */
    CalendarType["Islamic"] = "Islamic";
    /**
     * @public
     * @type {Japanese}
     */
    CalendarType["Japanese"] = "Japanese";
    /**
     * @public
     * @type {Buddhist}
     */
    CalendarType["Buddhist"] = "Buddhist";
    /**
     * @public
     * @type {Persian}
     */
    CalendarType["Persian"] = "Persian";
  })(CalendarType || (CalendarType = {}));
  var _default = CalendarType;
  _exports.default = _default;
});