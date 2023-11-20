sap.ui.define(["exports", "../InitialConfiguration"], function (_exports, _InitialConfiguration) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setTimezone = _exports.getTimezone = void 0;
  let currTimezone;
  /**
   * Returns the configured IANA timezone ID.
   *
   * @private
   * @returns {string}
   */
  const getTimezone = () => {
    if (currTimezone === undefined) {
      currTimezone = (0, _InitialConfiguration.getTimezone)();
    }
    return currTimezone;
  };
  /**
   * Sets the IANA timezone ID.
   * <b>For example:</b> "America/New_York", "Europe/London", "Australia/Sydney", "Asia/Bishkek", etc.
   *>
   * @param {string} timezone
   * @private
   * @returns { Promise<void> }
   */
  _exports.getTimezone = getTimezone;
  const setTimezone = timezone => {
    if (currTimezone === timezone) {
      return;
    }
    currTimezone = timezone;
  };
  _exports.setTimezone = setTimezone;
});