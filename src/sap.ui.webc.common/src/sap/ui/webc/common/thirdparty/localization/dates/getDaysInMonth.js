sap.ui.define(["exports", "./CalendarDate"], function (_exports, _CalendarDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const getDaysInMonth = date => {
    const tempCalendarDate = new _CalendarDate.default(date);
    tempCalendarDate.setDate(1);
    tempCalendarDate.setMonth(tempCalendarDate.getMonth() + 1);
    tempCalendarDate.setDate(0);
    return tempCalendarDate.getDate();
  };
  var _default = getDaysInMonth;
  _exports.default = _default;
});