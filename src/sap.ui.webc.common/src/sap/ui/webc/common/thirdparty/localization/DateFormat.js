sap.ui.define(["exports", "sap/ui/core/format/DateFormat"], function (_exports, _DateFormat) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DateFormat = _interopRequireDefault(_DateFormat);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // @ts-ignore

  const DateFormatWrapped = _DateFormat.default;
  class DateFormat extends DateFormatWrapped {}
  var _default = DateFormat;
  _exports.default = _default;
});