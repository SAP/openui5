sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const isElementHidden = el => {
    if (el.nodeName === "SLOT") {
      return false;
    }
    return el.offsetWidth <= 0 && el.offsetHeight <= 0 || el.style && el.style.visibility === "hidden";
  };
  var _default = isElementHidden;
  _exports.default = _default;
});