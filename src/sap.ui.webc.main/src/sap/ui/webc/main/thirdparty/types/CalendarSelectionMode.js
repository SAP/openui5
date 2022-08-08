sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.CalendarSelectionMode.prototype
   * @public
   */
  const CalendarSelectionModes = {
    /**
     * Only one date can be selected at a time
     * @public
     * @type {Single}
     */
    Single: "Single",

    /**
     * Several dates can be selected
     * @public
     * @type {Multiple}
     */
    Multiple: "Multiple",

    /**
     * A range defined by a start date and an end date can be selected
     * @public
     * @type {Range}
     */
    Range: "Range"
  };
  /**
   * @class
   * Different date selection modes for <code>ui5-calendar</code>.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.CalendarSelectionMode
   * @public
   * @enum {string}
   */

  class CalendarSelectionMode extends _DataType.default {
    static isValid(value) {
      return !!CalendarSelectionModes[value];
    }

  }

  CalendarSelectionMode.generateTypeAccessors(CalendarSelectionModes);
  var _default = CalendarSelectionMode;
  _exports.default = _default;
});