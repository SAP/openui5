sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Delays function execution by given threshold.
   * @param fn {Function}
   * @param delay {Integer}
   */
  let debounceInterval = null;
  const debounce = (fn, delay) => {
    debounceInterval && clearTimeout(debounceInterval);
    debounceInterval = setTimeout(() => {
      debounceInterval = null;
      fn();
    }, delay);
  };
  var _default = debounce;
  _exports.default = _default;
});