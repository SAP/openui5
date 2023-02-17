sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy", "sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp", "./DateComponentBase"], function (_exports, _Integer, _CalendarDate, _modifyDateBy, _getTodayUTCTimestamp, _DateComponentBase) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Integer = _interopRequireDefault(_Integer);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _modifyDateBy = _interopRequireDefault(_modifyDateBy);
  _getTodayUTCTimestamp = _interopRequireDefault(_getTodayUTCTimestamp);
  _DateComponentBase = _interopRequireDefault(_DateComponentBase);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @public
   */
  const metadata = {
    properties: /** @lends sap.ui.webcomponents.main.CalendarPart.prototype */{
      /**
       * The timestamp of the currently focused date. Set this property to move the component's focus to a certain date.
       * <b>Node:</b> Timestamp is 10-digit Integer representing the seconds (not milliseconds) since the Unix Epoch.
       * @type {Integer}
       * @protected
       */
      timestamp: {
        type: _Integer.default
      }
    }
  };

  /**
   * @class
   *
   * Abstract base class for Calendar, DayPicker, MonthPicker and YearPicker that adds support for:
   *  - common properties (timestamp, selectedDates): declarations and methods that operate on them
   *  - other common code
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.CalendarPart
   * @extends DateComponentBase
   * @public
   */
  class CalendarPart extends _DateComponentBase.default {
    static get metadata() {
      return metadata;
    }
    get _minTimestamp() {
      return this._minDate.valueOf() / 1000;
    }
    get _maxTimestamp() {
      return this._maxDate.valueOf() / 1000;
    }

    /**
     * Returns the effective timestamp to be used by the respective calendar part
     * @protected
     */
    get _timestamp() {
      let timestamp = this.timestamp !== undefined ? this.timestamp : (0, _getTodayUTCTimestamp.default)(this._primaryCalendarType);
      if (timestamp < this._minTimestamp || timestamp > this._maxTimestamp) {
        timestamp = this._minTimestamp;
      }
      return timestamp;
    }
    get _localDate() {
      return new Date(this._timestamp * 1000);
    }

    /**
     * Returns a CalendarDate instance, representing the _timestamp getter - this date is central to all components' rendering logic
     * @protected
     */
    get _calendarDate() {
      return _CalendarDate.default.fromTimestamp(this._localDate.getTime(), this._primaryCalendarType);
    }

    /**
     * Change a timestamp and enforce limits
     *
     * @param timestamp
     * @protected
     */
    _safelySetTimestamp(timestamp) {
      const min = this._minDate.valueOf() / 1000;
      const max = this._maxDate.valueOf() / 1000;
      if (timestamp < min) {
        timestamp = min;
      }
      if (timestamp > max) {
        timestamp = max;
      }
      this.timestamp = timestamp;
    }

    /**
     * Modify a timestamp by a certain amount of days/months/years and enforce limits
     * @param amount
     * @param unit
     * @protected
     */
    _safelyModifyTimestampBy(amount, unit) {
      const newDate = (0, _modifyDateBy.default)(this._calendarDate, amount, unit);
      this._safelySetTimestamp(newDate.valueOf() / 1000);
    }
    _getTimestampFromDom(domNode) {
      const oMonthDomRef = domNode.getAttribute("data-sap-timestamp");
      return parseInt(oMonthDomRef);
    }
  }
  var _default = CalendarPart;
  _exports.default = _default;
});