sap.ui.define(["exports", "./CalendarDate"], function (_exports, _CalendarDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getMinCalendarDate = _exports.getMaxCalendarDate = void 0;
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const cache = new Map();
  const getMinCalendarDate = primaryCalendarType => {
    const key = `min ${primaryCalendarType}`;
    if (!cache.has(key)) {
      const minDate = new _CalendarDate.default(1, 0, 1, primaryCalendarType);
      minDate.setYear(1);
      minDate.setMonth(0);
      minDate.setDate(1);
      cache.set(key, minDate);
    }
    return cache.get(key);
  };
  _exports.getMinCalendarDate = getMinCalendarDate;
  const getMaxCalendarDate = primaryCalendarType => {
    const key = `max ${primaryCalendarType}`;
    if (!cache.has(key)) {
      const maxDate = new _CalendarDate.default(1, 0, 1, primaryCalendarType);
      maxDate.setYear(9999);
      maxDate.setMonth(11);
      const tempDate = new _CalendarDate.default(maxDate, primaryCalendarType);
      tempDate.setDate(1);
      tempDate.setMonth(tempDate.getMonth() + 1, 0);
      maxDate.setDate(tempDate.getDate()); // 31st for Gregorian Calendar
      cache.set(key, maxDate);
    }
    return cache.get(key);
  };
  _exports.getMaxCalendarDate = getMaxCalendarDate;
});