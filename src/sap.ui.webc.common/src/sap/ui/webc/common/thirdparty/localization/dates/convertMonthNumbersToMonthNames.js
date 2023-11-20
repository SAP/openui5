sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "../getCachedLocaleDataInstance"], function (_exports, _getLocale, _getCachedLocaleDataInstance) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getLocale = _interopRequireDefault(_getLocale);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Convert month number to month name (text).
   * If the numbers of the two months are the same you will get the name of the month,
   * otherwise you will get the two names separated by a dash
   *
   * @param firstMonth CalendarDate Month
   * @param lastMonth CalendarDate Month
   * @param calendarType calendar type
   * @returns {String}
   */
  const convertMonthNumbersToMonthNames = (firstMonth, lastMonth, calendarType) => {
    const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
    const pattern = localeData.getIntervalPattern("");
    const secondaryMonthsNames = localeData.getMonthsStandAlone("abbreviated", calendarType);
    const secondaryMonthsNamesWide = localeData.getMonthsStandAlone("wide", calendarType);
    if (firstMonth === lastMonth) {
      return {
        text: localeData.getMonths("abbreviated", calendarType)[firstMonth],
        textInfo: localeData.getMonths("wide", calendarType)[firstMonth]
      };
    }
    return {
      text: pattern.replace(/\{0\}/, secondaryMonthsNames[firstMonth]).replace(/\{1\}/, secondaryMonthsNames[lastMonth]),
      textInfo: pattern.replace(/\{0\}/, secondaryMonthsNamesWide[firstMonth]).replace(/\{1\}/, secondaryMonthsNamesWide[lastMonth])
    };
  };
  var _default = convertMonthNumbersToMonthNames;
  _exports.default = _default;
});