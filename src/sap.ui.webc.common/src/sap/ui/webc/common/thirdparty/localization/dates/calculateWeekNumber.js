sap.ui.define(["exports", "./UniversalDate"], function (_exports, _UniversalDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UniversalDate = _interopRequireDefault(_UniversalDate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const calculateWeekNumber = (confFirstDayOfWeek, oDate, iYear, oLocale, oLocaleData) => {
    let iWeekNum = 0;
    let iWeekDay = 0;
    const iFirstDayOfWeek = Number.isInteger(confFirstDayOfWeek) ? confFirstDayOfWeek : oLocaleData.getFirstDayOfWeek();
    // search Locale for containing "en-US", since sometimes
    // when any user settings have been defined, subtag "sapufmt" is added to the locale name
    // this is described inside sap.ui.core.Configuration file
    if (oLocale && oLocale.getLanguage() === "en" && oLocale.getRegion() === "US") {
      /*
          * in US the week starts with Sunday
          * The first week of the year starts with January 1st. But Dec. 31 is still in the last year
          * So the week beginning in December and ending in January has 2 week numbers
          */
      const oJanFirst = new _UniversalDate.default(oDate.getTime());
      oJanFirst.setUTCFullYear(iYear, 0, 1);
      iWeekDay = oJanFirst.getUTCDay();
      // get the date for the same weekday like jan 1.
      const oCheckDate = new _UniversalDate.default(oDate.getTime());
      oCheckDate.setUTCDate(oCheckDate.getUTCDate() - oCheckDate.getUTCDay() + iWeekDay);
      iWeekNum = Math.round((oCheckDate.getTime() - oJanFirst.getTime()) / 86400000 / 7) + 1;
    } else {
      // normally the first week of the year is the one where the first Thursday of the year is
      // find Thursday of this week
      // if the checked day is before the 1. day of the week use a day of the previous week to check
      const oThursday = new _UniversalDate.default(oDate.getTime());
      oThursday.setUTCDate(oThursday.getUTCDate() - iFirstDayOfWeek);
      iWeekDay = oThursday.getUTCDay();
      oThursday.setUTCDate(oThursday.getUTCDate() - iWeekDay + 4);
      const oFirstDayOfYear = new _UniversalDate.default(oThursday.getTime());
      oFirstDayOfYear.setUTCMonth(0, 1);
      iWeekDay = oFirstDayOfYear.getUTCDay();
      let iAddDays = 0;
      if (iWeekDay > 4) {
        iAddDays = 7; // first day of year is after Thursday, so first Thursday is in the next week
      }

      const oFirstThursday = new _UniversalDate.default(oFirstDayOfYear.getTime());
      oFirstThursday.setUTCDate(1 - iWeekDay + 4 + iAddDays);
      iWeekNum = Math.round((oThursday.getTime() - oFirstThursday.getTime()) / 86400000 / 7) + 1;
    }
    return iWeekNum;
  };
  var _default = calculateWeekNumber;
  _exports.default = _default;
});