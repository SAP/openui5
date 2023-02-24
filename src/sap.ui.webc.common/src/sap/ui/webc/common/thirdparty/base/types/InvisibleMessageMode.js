sap.ui.define(["exports", "./DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Enumeration for different mode behaviors of the <code>InvisibleMessage</code>.
   * @private
   */
  const InvisibleMessageModes = {
    /**
        * Indicates that updates to the region should be presented at the next graceful opportunity,
        * such as at the end of reading the current sentence, or when the user pauses typing.
        */
    Polite: "Polite",
    /**
        * Indicates that updates to the region have the highest priority and should be presented to the user immediately.
        */
    Assertive: "Assertive"
  };
  class InvisibleMessageMode extends _DataType.default {
    static isValid(value) {
      return !!InvisibleMessageModes[value];
    }
  }
  InvisibleMessageMode.generateTypeAccessors(InvisibleMessageModes);
  var _default = InvisibleMessageModes;
  _exports.default = _default;
});