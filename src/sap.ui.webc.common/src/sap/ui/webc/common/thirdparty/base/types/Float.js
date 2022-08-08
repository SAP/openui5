sap.ui.define(["exports", "./DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  class Float extends _DataType.default {
    static isValid(value) {
      // Assuming that integers are floats as well!
      return Number(value) === value;
    }

    static attributeToProperty(attributeValue) {
      return parseFloat(attributeValue);
    }

  }

  var _default = Float;
  _exports.default = _default;
});