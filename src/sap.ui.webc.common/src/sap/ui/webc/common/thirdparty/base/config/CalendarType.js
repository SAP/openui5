sap.ui.define(["exports", "../types/CalendarType", "../InitialConfiguration"], function (_exports, _CalendarType, _InitialConfiguration) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getSecondaryCalendarType = _exports.getCalendarType = void 0;
  _CalendarType = _interopRequireDefault(_CalendarType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let calendarType;
  let secondaryCalendarType;
  /**
   * Returns the configured or default calendar type.
   * @public
   * @returns { CalendarType } the effective calendar type
   */
  const getCalendarType = () => {
    if (calendarType === undefined) {
      calendarType = (0, _InitialConfiguration.getCalendarType)();
    }
    if (calendarType && calendarType in _CalendarType.default) {
      return calendarType;
    }
    return _CalendarType.default.Gregorian;
  };
  /**
   * Returns the configured secondary calendar type.
   * @public
   * @returns { CalendarType | undefined } the effective calendar type
   * @since 1.18.0
   */
  _exports.getCalendarType = getCalendarType;
  const getSecondaryCalendarType = () => {
    if (secondaryCalendarType === undefined) {
      secondaryCalendarType = (0, _InitialConfiguration.getSecondaryCalendarType)();
    }
    if (secondaryCalendarType && secondaryCalendarType in _CalendarType.default) {
      return secondaryCalendarType;
    }
    return secondaryCalendarType;
  };
  _exports.getSecondaryCalendarType = getSecondaryCalendarType;
});