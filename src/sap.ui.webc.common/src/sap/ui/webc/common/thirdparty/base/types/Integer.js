sap.ui.define(["exports", "./DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  class Integer extends _DataType.default {
    static isValid(value) {
      return Number.isInteger(value);
    }
    static attributeToProperty(attributeValue) {
      return parseInt(attributeValue);
    }
  }
  var _default = Integer;
  _exports.default = _default;
});