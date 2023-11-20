sap.ui.define(["exports", "./UI5Date", "./UniversalDate"], function (_exports, _UI5Date, _UniversalDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Date = _interopRequireDefault(_UI5Date);
  _UniversalDate = _interopRequireDefault(_UniversalDate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  class CalendarDate {
    constructor(year, month, date, calendarType) {
      let aArgs = arguments,
        // eslint-disable-line
        oJSDate,
        oNow,
        sCalendarType;
      switch (aArgs.length) {
        case 0:
          // defaults to the current date
          oNow = _UI5Date.default.getInstance();
          return this.constructor(oNow.getFullYear(), oNow.getMonth(), oNow.getDate());
        case 1: // CalendarDate
        case 2:
          // CalendarDate, sCalendarType
          if (!(aArgs[0] instanceof CalendarDate)) {
            throw new Error("Invalid arguments: the first argument must be of type CalendarDate.");
          }
          sCalendarType = aArgs[1] ? aArgs[1] : aArgs[0]._oUDate.sCalendarType;
          // Use source.valueOf() (returns the same point of time regardless calendar type) instead of
          // source's getters to avoid non-gregorian Year, Month and Date may be used to construct a Gregorian date
          oJSDate = _UI5Date.default.getInstance(aArgs[0].valueOf());
          // Make this date really local. Now getters are safe.
          oJSDate.setFullYear(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate());
          oJSDate.setHours(oJSDate.getUTCHours(), oJSDate.getUTCMinutes(), oJSDate.getUTCSeconds(), oJSDate.getUTCMilliseconds());
          this._oUDate = createUniversalUTCDate(oJSDate, sCalendarType);
          break;
        case 3: // year, month, date
        case 4:
          // year, month, date, sCalendarType
          checkNumericLike(aArgs[0], `Invalid year: ${aArgs[0]}`);
          checkNumericLike(aArgs[1], `Invalid month: ${aArgs[1]}`);
          checkNumericLike(aArgs[2], `Invalid date: ${aArgs[2]}`);
          oJSDate = _UI5Date.default.getInstance(0, 0, 1);
          oJSDate.setFullYear(aArgs[0], aArgs[1], aArgs[2]); // 2 digits year is not supported. If so, it is considered as full year as well.
          if (aArgs[3]) {
            sCalendarType = aArgs[3];
          }
          this._oUDate = createUniversalUTCDate(oJSDate, sCalendarType);
          break;
        default:
          throw new Error(`${"Invalid arguments. Accepted arguments are: 1) oCalendarDate, (optional)calendarType" + "or 2) year, month, date, (optional) calendarType"}${aArgs}`);
      }
    }
    getYear() {
      return this._oUDate.getUTCFullYear();
    }
    setYear(year) {
      checkNumericLike(year, `Invalid year: ${year}`);
      this._oUDate.setUTCFullYear(year);
      return this;
    }
    getMonth() {
      return this._oUDate.getUTCMonth();
    }
    /**
     * Sets the given month as ordinal month of the year.
     * @param {int} month An integer between 0 and 11, representing the months January through December( or their
     * equivalent month names for the given calendar).
     * If the specified value is is outside of the expected range, this method attempts to update the date information
     * accordingly. For example, if 12 is given as a month, the year will be incremented by 1, and 1 will be used for month.
     * @param {int} [date] An integer between 1 and 31, representing the day of the month, but other values are allowed.
     * 0 will result in the previous month's last day.
     * -1 will result in the day before the previous month's last day.
     * 32 will result in:
     * - first day of the next month if the current month has 31 days.
     * - second day of the next month if the current month has 30 days.
     * Other value will result in adding or subtracting days according to the given value.
     * @returns {sap.ui.unified.calendar.CalendarDate} <code>this</code> for method chaining.
     */
    setMonth(month, date) {
      checkNumericLike(month, `Invalid month: ${month}`);
      if (date || date === 0) {
        checkNumericLike(date, `Invalid date: ${date}`);
        this._oUDate.setUTCMonth(month, date);
      } else {
        this._oUDate.setUTCMonth(month);
      }
      return this;
    }
    getDate() {
      return this._oUDate.getUTCDate();
    }
    setDate(date) {
      checkNumericLike(date, `Invalid date: ${date}`);
      this._oUDate.setUTCDate(date);
      return this;
    }
    getDay() {
      return this._oUDate.getUTCDay();
    }
    getCalendarType() {
      return this._oUDate.sCalendarType;
    }
    isBefore(oCalendarDate) {
      checkCalendarDate(oCalendarDate);
      return this.valueOf() < oCalendarDate.valueOf();
    }
    isAfter(oCalendarDate) {
      checkCalendarDate(oCalendarDate);
      return this.valueOf() > oCalendarDate.valueOf();
    }
    isSameOrBefore(oCalendarDate) {
      checkCalendarDate(oCalendarDate);
      return this.valueOf() <= oCalendarDate.valueOf();
    }
    isSameOrAfter(oCalendarDate) {
      checkCalendarDate(oCalendarDate);
      return this.valueOf() >= oCalendarDate.valueOf();
    }
    isSame(oCalendarDate) {
      checkCalendarDate(oCalendarDate);
      return this.valueOf() === oCalendarDate.valueOf();
    }
    toLocalJSDate() {
      // Use this._oUDate.getTime()(returns the same point of time regardless calendar type)  instead of
      // this._oUDate's getters to avoid non-gregorian Year, Month and Date to be used to construct a Gregorian date
      const oLocalDate = _UI5Date.default.getInstance(this._oUDate.getTime());
      // Make this date really local. Now getters are safe.
      oLocalDate.setFullYear(oLocalDate.getUTCFullYear(), oLocalDate.getUTCMonth(), oLocalDate.getUTCDate());
      oLocalDate.setHours(0, 0, 0, 0);
      return oLocalDate;
    }
    toUTCJSDate() {
      // Use this._oUDate.getTime()(returns the same point of time regardless calendar type)  instead of
      // this._oUDate's getters to avoid non-gregorian Year, Month and Date to be used to construct a Gregorian date
      const oUTCDate = _UI5Date.default.getInstance(this._oUDate.getTime());
      oUTCDate.setUTCHours(0, 0, 0, 0);
      return oUTCDate;
    }
    toString() {
      return `${this._oUDate.sCalendarType}: ${this.getYear()}/${this.getMonth() + 1}/${this.getDate()}`;
    }
    valueOf() {
      return this._oUDate.getTime();
    }
    static fromLocalJSDate(oJSDate, sCalendarType) {
      // Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
      // because Date object in the test is different than the Date object in the application (due to the iframe).
      // We can use jQuery.type or this method:
      function isValidDate(date) {
        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date); // eslint-disable-line
      }

      if (!isValidDate(oJSDate)) {
        throw new Error(`Date parameter must be a JavaScript Date object: [${oJSDate}].`);
      }
      return new CalendarDate(oJSDate.getFullYear(), oJSDate.getMonth(), oJSDate.getDate(), sCalendarType);
    }
    static fromTimestamp(iTimestamp, sCalendarType) {
      const oCalDate = new CalendarDate(0, 0, 1);
      let oUDate;
      try {
        oUDate = _UniversalDate.default.getInstance(_UI5Date.default.getInstance(iTimestamp), sCalendarType);
      } catch (e) {
        oUDate = new Date(NaN); // UniversalDate.getInstance may now throw an Exception - keep the old behavior
      }

      oCalDate._oUDate = oUDate;
      return oCalDate;
    }
  }
  function createUniversalUTCDate(oDate, sCalendarType) {
    if (sCalendarType) {
      return _UniversalDate.default.getInstance(createUTCDate(oDate), sCalendarType);
    }
    return new _UniversalDate.default(createUTCDate(oDate).getTime());
  }
  /**
   * Creates a JavaScript UTC Date corresponding to the given JavaScript Date.
   * @param {Date} oDate JavaScript date object. Time related information is cut.
   * @returns {Date} JavaScript date created from the date object, but this time considered as UTC date information.
   */
  function createUTCDate(oDate) {
    const oUTCDate = new Date(Date.UTC(0, 0, 1)); // no need to replace with UI5Date as we are creating a new UTC date object
    oUTCDate.setUTCFullYear(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
    return oUTCDate;
  }
  function checkCalendarDate(oCalendarDate) {
    if (!(oCalendarDate instanceof CalendarDate)) {
      throw new Error(`Invalid calendar date: [${oCalendarDate}]. Expected: CalendarDate`);
    }
  }
  /**
   * Verifies the given value is numeric like, i.e. 3, "3" and throws an error if it is not.
   * @param {any} value The value of any type to check. If null or undefined, this method throws an error.
   * @param {string} message The message to be used if an error is to be thrown
   * @throws will throw an error if the value is null or undefined or is not like a number
   */
  function checkNumericLike(value, message) {
    if (value === undefined || value === Infinity || isNaN(value)) {
      // eslint-disable-line
      throw message;
    }
  }
  var _default = CalendarDate;
  _exports.default = _default;
});