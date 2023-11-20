sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.markAsRtlAware = _exports.isRtlAware = void 0;
  const rtlAwareSet = new Set();
  const markAsRtlAware = klass => {
    rtlAwareSet.add(klass);
  };
  _exports.markAsRtlAware = markAsRtlAware;
  const isRtlAware = klass => {
    return rtlAwareSet.has(klass);
  };
  _exports.isRtlAware = isRtlAware;
});