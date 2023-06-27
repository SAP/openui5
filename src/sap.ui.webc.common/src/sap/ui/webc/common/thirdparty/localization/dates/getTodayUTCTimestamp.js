sap.ui.define(["exports", "./CalendarDate", "./UI5Date"], function (_exports, _CalendarDate, _UI5Date) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _UI5Date = _interopRequireDefault(_UI5Date);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Returns a UTC timestamp representing today
   * @public
   */
  const getTodayUTCTimestamp = primaryCalendarType => _CalendarDate.default.fromLocalJSDate(_UI5Date.default.getInstance(), primaryCalendarType).valueOf() / 1000;
  var _default = getTodayUTCTimestamp;
  _exports.default = _default;
});