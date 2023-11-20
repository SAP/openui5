sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy", "sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp", "./DateComponentBase"], function (_exports, _property, _Integer, _CalendarDate, _modifyDateBy, _getTodayUTCTimestamp, _DateComponentBase) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _property = _interopRequireDefault(_property);
  _Integer = _interopRequireDefault(_Integer);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _modifyDateBy = _interopRequireDefault(_modifyDateBy);
  _getTodayUTCTimestamp = _interopRequireDefault(_getTodayUTCTimestamp);
  _DateComponentBase = _interopRequireDefault(_DateComponentBase);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
   * @alias sap.ui.webc.main.CalendarPart
   * @extends sap.ui.webc.main.DateComponentBase
   * @public
   */
  class CalendarPart extends _DateComponentBase.default {
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
      if (this._maxTimestamp && this._maxTimestamp < timestamp) {
        timestamp = this._maxTimestamp;
      } else if (this._minTimestamp && this._minTimestamp > timestamp) {
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
     * @param preserveDate whether to preserve the day of the month (f.e. 15th of March + 1 month = 15th of April)
     * @protected
     */
    _safelyModifyTimestampBy(amount, unit, preserveDate) {
      const newDate = (0, _modifyDateBy.default)(this._calendarDate, amount, unit, preserveDate);
      this._safelySetTimestamp(newDate.valueOf() / 1000);
    }
    _getTimestampFromDom(domNode) {
      const oMonthDomRef = domNode.getAttribute("data-sap-timestamp");
      return parseInt(oMonthDomRef);
    }
  }
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], CalendarPart.prototype, "timestamp", void 0);
  var _default = CalendarPart;
  _exports.default = _default;
});