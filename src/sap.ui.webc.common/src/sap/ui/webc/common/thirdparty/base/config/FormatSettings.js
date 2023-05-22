sap.ui.define(["exports", "../features/LegacyDateFormats", "../InitialConfiguration", "../FeaturesRegistry"], function (_exports, _LegacyDateFormats, _InitialConfiguration, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getLegacyDateCalendarCustomizing = _exports.getFirstDayOfWeek = void 0;
  _LegacyDateFormats = _interopRequireDefault(_LegacyDateFormats);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let formatSettings;
  /**
   * Returns the first day of the week from the configured format settings or based on the current locale.
   * @public
   * @returns {Number} 0 (Sunday) through 6 (Saturday)
   */
  const getFirstDayOfWeek = () => {
    if (formatSettings === undefined) {
      formatSettings = (0, _InitialConfiguration.getFormatSettings)();
    }
    return formatSettings.firstDayOfWeek;
  };
  _exports.getFirstDayOfWeek = getFirstDayOfWeek;
  const legacyDateFormats = (0, _FeaturesRegistry.getFeature)("LegacyDateFormats");
  const getLegacyDateCalendarCustomizing = legacyDateFormats ? _LegacyDateFormats.default.getLegacyDateCalendarCustomizing : () => {
    return [];
  };
  _exports.getLegacyDateCalendarCustomizing = getLegacyDateCalendarCustomizing;
});