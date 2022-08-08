sap.ui.define(["exports", "./SlotsHelper"], function (_exports, _SlotsHelper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const isDefaultSlotProvided = element => {
    return Array.from(element.childNodes).filter(node => {
      return node.nodeType !== Node.COMMENT_NODE && (0, _SlotsHelper.getSlotName)(node) === "default" && (node.nodeType !== Node.TEXT_NODE || node.nodeValue.trim().length !== 0);
    }).length > 0;
  };

  var _default = isDefaultSlotProvided;
  _exports.default = _default;
});