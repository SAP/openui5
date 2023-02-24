sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const getSingletonElementInstance = (tag, parentElement = document.body) => {
    let el = document.querySelector(tag);
    if (el) {
      return el;
    }
    el = document.createElement(tag);
    return parentElement.insertBefore(el, parentElement.firstChild);
  };
  var _default = getSingletonElementInstance;
  _exports.default = _default;
});