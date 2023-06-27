sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Returns a timestamp with only the year, month and day (with zero hours, minutes and seconds) and without 000 for milliseconds
   * @param { number } millisecondsUTC
   * @returns { number }
   */
  const getRoundedTimestamp = millisecondsUTC => {
    if (!millisecondsUTC) {
      // no need to replace with UI5Date, as we don't use any non-UTC functions
      millisecondsUTC = new Date().getTime();
    }
    const rounded = millisecondsUTC - millisecondsUTC % (24 * 60 * 60 * 1000);
    return rounded / 1000;
  };
  var _default = getRoundedTimestamp;
  _exports.default = _default;
});