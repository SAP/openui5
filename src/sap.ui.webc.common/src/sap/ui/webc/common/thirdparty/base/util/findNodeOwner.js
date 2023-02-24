sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const findNodeOwner = node => {
    if (!(node instanceof HTMLElement)) {
      throw new Error("Argument node should be of type HTMLElement");
    }
    const ownerTypes = [HTMLHtmlElement, HTMLIFrameElement];
    let currentShadowRootFlag = true;
    let currentCustomElementFlag = true;
    while (node) {
      if (node.toString() === "[object ShadowRoot]") {
        // Web Component
        // or the shadow root of web component with attached shadow root
        if (currentShadowRootFlag) {
          currentShadowRootFlag = false;
        }
        if (!currentCustomElementFlag && !currentShadowRootFlag) {
          return node;
        }
      } else if (node.tagName && node.tagName.indexOf("-") > -1) {
        if (currentCustomElementFlag) {
          currentCustomElementFlag = false;
        } else {
          return node;
        }
      } else if (ownerTypes.indexOf(node.constructor) > -1) {
        // Document or Iframe reached
        return node;
      }
      node = node.parentNode || node.host;
    }
  };
  var _default = findNodeOwner;
  _exports.default = _default;
});