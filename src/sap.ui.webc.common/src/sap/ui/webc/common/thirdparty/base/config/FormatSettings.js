sap.ui.define(["exports", "../InitialConfiguration"], function (_exports, _InitialConfiguration) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getFirstDayOfWeek = void 0;
  let formatSettings;
  const getFirstDayOfWeek = () => {
    if (formatSettings === undefined) {
      formatSettings = (0, _InitialConfiguration.getFormatSettings)();
    }
    return formatSettings.firstDayOfWeek;
  };

  // eslint-disable-line
  _exports.getFirstDayOfWeek = getFirstDayOfWeek;
});