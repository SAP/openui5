sap.ui.define(["exports", "./CalendarDate"], function (_exports, _CalendarDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _CalendarDate = _interopRequireDefault(_CalendarDate);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Returns a UTC timestamp representing today
   * @public
   */
  const getTodayUTCTimestamp = primaryCalendarType => _CalendarDate.default.fromLocalJSDate(new Date(), primaryCalendarType).valueOf() / 1000;

  var _default = getTodayUTCTimestamp;
  _exports.default = _default;
});