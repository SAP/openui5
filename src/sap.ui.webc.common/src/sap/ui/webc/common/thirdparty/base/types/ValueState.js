sap.ui.define(["exports", "./DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different states.
   */
  const ValueStates = {
    None: "None",
    Success: "Success",
    Warning: "Warning",
    Error: "Error",
    Information: "Information"
  };

  class ValueState extends _DataType.default {
    static isValid(value) {
      return !!ValueStates[value];
    }

  }

  ValueState.generateTypeAccessors(ValueStates);
  var _default = ValueState;
  _exports.default = _default;
});