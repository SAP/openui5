sap.ui.define(["exports", "../InitialConfiguration", "../FeaturesRegistry"], function (_exports, _InitialConfiguration, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let formatSettings;
  class LegacyDateFormats {
    /**
     * Returns the currently set customizing data for Islamic calendar support
     *
     * @return {object[]} Returns an array that contains the customizing data.
     * @public
     */
    static getLegacyDateCalendarCustomizing() {
      if (formatSettings === undefined) {
        formatSettings = (0, _InitialConfiguration.getFormatSettings)();
      }
      return formatSettings.legacyDateCalendarCustomizing || [];
    }
  }
  (0, _FeaturesRegistry.registerFeature)("LegacyDateFormats", LegacyDateFormats);
  var _default = LegacyDateFormats;
  _exports.default = _default;
});