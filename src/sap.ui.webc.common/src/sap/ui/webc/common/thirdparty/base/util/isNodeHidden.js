sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const isNodeHidden = node => {
    if (node.nodeName === "SLOT") {
      return false;
    }
    return node.offsetWidth <= 0 && node.offsetHeight <= 0 || node.style && node.style.visibility === "hidden";
  };
  var _default = isNodeHidden;
  _exports.default = _default;
});