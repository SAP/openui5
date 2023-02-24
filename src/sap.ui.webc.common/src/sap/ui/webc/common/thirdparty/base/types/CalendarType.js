sap.ui.define(["exports", "./DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Different calendar types.
   */
  const CalendarTypes = {
    Gregorian: "Gregorian",
    Islamic: "Islamic",
    Japanese: "Japanese",
    Buddhist: "Buddhist",
    Persian: "Persian"
  };
  class CalendarType extends _DataType.default {
    static isValid(value) {
      return !!CalendarTypes[value];
    }
  }
  CalendarType.generateTypeAccessors(CalendarTypes);
  var _default = CalendarType;
  _exports.default = _default;
});