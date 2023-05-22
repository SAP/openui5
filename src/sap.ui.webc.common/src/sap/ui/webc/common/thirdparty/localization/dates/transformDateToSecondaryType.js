sap.ui.define(["exports", "./CalendarDate", "./getDaysInMonth", "./UI5Date"], function (_exports, _CalendarDate, _getDaysInMonth, _UI5Date) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _getDaysInMonth = _interopRequireDefault(_getDaysInMonth);
  _UI5Date = _interopRequireDefault(_UI5Date);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const transformDateToSecondaryType = (primaryCalendarType, secondaryCalendarType, timeStamp, hasYearPicker) => {
    let firstDate = _CalendarDate.default.fromLocalJSDate(_UI5Date.default.getInstance(timeStamp * 1000), primaryCalendarType);
    let lastDate = _CalendarDate.default.fromLocalJSDate(_UI5Date.default.getInstance(timeStamp * 1000), primaryCalendarType);
    firstDate.setDate(1);
    if (hasYearPicker) {
      firstDate.setMonth(0);
      lastDate.setMonth(11);
    }
    lastDate.setDate((0, _getDaysInMonth.default)(lastDate));
    firstDate = new _CalendarDate.default(firstDate, secondaryCalendarType);
    lastDate = new _CalendarDate.default(lastDate, secondaryCalendarType);
    return {
      firstDate,
      lastDate
    };
  };
  var _default = transformDateToSecondaryType;
  _exports.default = _default;
});