sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Returns a value clamped between an upper bound 'max' and lower bound 'min'.
   * @param {number} val value
   * @param {number} min lower bound
   * @param {number} max upper bound
   * @returns {number}
   */
  const clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max);
  };
  var _default = clamp;
  _exports.default = _default;
});