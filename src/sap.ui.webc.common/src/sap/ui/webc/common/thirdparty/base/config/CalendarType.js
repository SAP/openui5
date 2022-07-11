sap.ui.define(["exports", "../types/CalendarType", "../InitialConfiguration"], function (_exports, _CalendarType, _InitialConfiguration) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getCalendarType = void 0;
  _CalendarType = _interopRequireDefault(_CalendarType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  let calendarType;

  const getCalendarType = () => {
    if (calendarType === undefined) {
      calendarType = (0, _InitialConfiguration.getCalendarType)();
    }

    if (_CalendarType.default.isValid(calendarType)) {
      return calendarType;
    }

    return _CalendarType.default.Gregorian;
  }; // eslint-disable-line


  _exports.getCalendarType = getCalendarType;
});