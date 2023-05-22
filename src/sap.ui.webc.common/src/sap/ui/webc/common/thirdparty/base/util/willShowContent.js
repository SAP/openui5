sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const willShowContent = childNodes => {
    return Array.from(childNodes).filter(node => {
      return node.nodeType !== Node.COMMENT_NODE && (node.nodeType !== Node.TEXT_NODE || (node.nodeValue || "").trim().length !== 0);
    }).length > 0;
  };
  var _default = willShowContent;
  _exports.default = _default;
});