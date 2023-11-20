sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const whenDOMReady = () => {
    return new Promise(resolve => {
      if (document.body) {
        resolve();
      } else {
        document.addEventListener("DOMContentLoaded", () => {
          resolve();
        });
      }
    });
  };
  var _default = whenDOMReady;
  _exports.default = _default;
});